/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  booleanAttribute,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL } from '@siemens/element-ng/form';
import { Subscription } from 'rxjs';

import { SiDateInputDirective } from './si-date-input.directive';
import { SiDatepickerOverlayComponent } from './si-datepicker-overlay.component';
import { SiDatepickerOverlayDirective } from './si-datepicker-overlay.directive';
import { getDatepickerFormat } from './si-datepicker.model';

@Directive({
  selector: '[siDatepicker]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiDatepickerDirective,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiDatepickerDirective,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiDatepickerDirective
    }
  ],
  hostDirectives: [
    {
      directive: SiDatepickerOverlayDirective,
      outputs: ['siDatepickerClose']
    }
  ],
  exportAs: 'siDatepicker'
})
export class SiDatepickerDirective extends SiDateInputDirective implements AfterViewInit {
  /**
   * Automatically close overlay on date selection.
   * Do not use this behavior with config showTime = true, because it
   * will close the overlay when the user change one of the time units.
   *
   * @defaultValue false
   */
  readonly autoClose = input(false, { transform: booleanAttribute });

  /**
   * During focus on close the datepicker will not show since we recover the focus on element.
   * The focus on close is only relevant when the directive is configured without a calendar button.
   */
  private overlaySubscriptions?: Subscription[];
  private externalTrigger?: ElementRef<HTMLElement>;
  private readonly overlayToggle = inject(SiDatepickerOverlayDirective);

  ngAfterViewInit(): void {
    // Update datepicker with new date value
    this.dateChange.subscribe(date => this.overlayToggle.setInputs({ date }));
  }

  /** @internal */
  touch(): void {
    this.onTouched();
  }

  /**
   * On click shall show datepicker.
   */
  @HostListener('click')
  protected onClick(): void {
    if (!this.externalTrigger) {
      this.show();
    }
  }

  /**
   * Focus out shall close the datepicker except we are moving the focus to the datepicker.
   * @param event - focus out event with the related target
   */
  protected override onBlur(event: FocusEvent): void {
    const target = event.relatedTarget as HTMLElement;
    if (!this.externalTrigger && !this.overlayToggle.contains(target)) {
      this.overlayToggle.closeOverlay();
      this.onTouched();
    }
  }

  @HostListener('keydown.tab')
  protected onTab(): void {
    if (this.overlayToggle.isShown()) {
      this.overlayToggle.closeOverlay();
    }
  }

  /**
   * @internal
   */
  public show(initialFocus = false): void {
    if (this.disabled() || this.readonly() || this.overlayToggle.isShown()) {
      return;
    }

    this.subscribeDateChanges(
      this.overlayToggle.showOverlay(initialFocus, {
        config: this.siDatepickerConfig(),
        date: this.date,
        time12h: this.getTime12h()
      })
    );
  }

  /**
   * @internal
   */
  public useExternalTrigger(element: ElementRef<HTMLElement>): void {
    this.externalTrigger = element;
  }

  @HostListener('focus')
  protected focusChange(): void {
    if (!this.externalTrigger) {
      this.show();
    }
  }

  private getTime12h(): boolean | undefined {
    const dateFormat = getDatepickerFormat(this.locale, this.siDatepickerConfig(), true);
    return dateFormat?.includes('a');
  }

  private subscribeDateChanges(overlay?: ComponentRef<SiDatepickerOverlayComponent>): void {
    this.overlaySubscriptions?.forEach(s => s.unsubscribe());

    overlay?.instance.date.subscribe(d => this.onDateChanged(d));
    overlay?.instance.disabledTimeChange.subscribe(d => this.onDisabledTime(d));
  }

  /**
   * Callback when the datepicker changes his value.
   * @param date - updated date
   */
  protected override onDateChanged(date?: Date): void {
    // While typing a date can be invalid and the datepicker component will automatically change the date to undefined.
    // Since we don't want to reset the current input value it is necessary to ignore those updates.
    if (!date) {
      return;
    }
    super.onDateChanged(date);
    if (this.autoClose()) {
      // a tick later so the event won't end on the wrong element
      setTimeout(() => this.overlayToggle.closeAfterSelection());
    }
  }
}
