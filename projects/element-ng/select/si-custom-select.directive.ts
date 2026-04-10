/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { filter, merge, Subject, takeUntil } from 'rxjs';

import type { SiSelectDropdownDirective } from './si-select-dropdown.directive';

/**
 * Host directive for building custom selects.
 *
 * Add this as a `hostDirective` on your component and expose the inputs/outputs you need.
 * The directive handles:
 * - {@link ControlValueAccessor} integration (`formControl`, `ngModel`, `[(value)]`)
 * - Disabled / readonly state management
 * - Overlay lifecycle for the dropdown (open/close)
 * - Focus management and focus trapping in the dropdown
 * - Opening the dropdown on click, Enter, Space, ArrowDown, ArrowUp
 * - {@link SiFormItemControl} integration
 *
 * Use {@link SiSelectDropdownDirective} to mark the dropdown template in your component,
 * and call {@link open}, {@link close}, {@link updateValue} from your component logic.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-my-select',
 *   hostDirectives: [{
 *     directive: SiCustomSelectDirective,
 *     inputs: ['disabled', 'readonly', 'value'],
 *     outputs: ['valueChange']
 *   }],
 *   template: `
 *     <si-select-combobox>
 *       {{ select.value() }}
 *     </si-select-combobox>
 *     <ng-template si-select-dropdown contentType="listbox">
 *       <button (click)="select.updateValue('new'); select.close()">Pick</button>
 *     </ng-template>
 *   `
 * })
 * export class MySelectComponent {
 *   readonly select = inject(SiCustomSelectDirective);
 * }
 * ```
 *
 * @experimental
 */
@Directive({
  selector: '[siCustomSelect]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: SiCustomSelectDirective, multi: true },
    { provide: SI_FORM_ITEM_CONTROL, useExisting: SiCustomSelectDirective }
  ],
  host: {
    class: 'dropdown',
    '[style.--si-action-icon-offset.rem]': '1.5',
    role: 'combobox',
    'aria-autocomplete': 'none',
    '[attr.aria-haspopup]': 'haspopup()',
    '[attr.aria-labelledby]': 'labelledby()',
    '[attr.aria-describedby]': 'errormessageId()',
    '[attr.aria-controls]': 'isOpen() ? dropdownId() : null',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? "-1" : "0"',
    '[class.disabled]': 'disabled()',
    '[class.pe-none]': 'disabled()',
    '[class.readonly]': 'readonly()',
    '[class.open]': 'isOpen()',
    '[class.show]': 'isOpen()',
    '(click)': 'open()',
    '(keydown.enter)': 'open()',
    '(keydown.space)': 'open($event)',
    '(keydown.arrowDown)': 'open($event)',
    '(keydown.arrowUp)': 'open($event)'
  }
})
export class SiCustomSelectDirective<T> implements ControlValueAccessor, SiFormItemControl {
  private static idCounter = 0;

  /**
   * Unique identifier.
   *
   * @defaultValue
   * ```
   * `__si-custom-select-${SiCustomSelectDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-custom-select-${SiCustomSelectDirective.idCounter++}`);

  /**
   * Whether the select input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Readonly state. Similar to disabled but with higher contrast.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Emits when the dropdown open state changes. */
  readonly openChange = output<boolean>();

  /**
   * The current value, supports two-way binding via `[(value)]`.
   *
   * @defaultValue undefined
   */
  readonly value = model<T | undefined>(undefined);

  /**
   * Whether the dropdown is currently open.
   *
   * @defaultValue false
   */
  readonly isOpen = signal(false);

  /** @internal */
  readonly labelledby = computed(() => `${this.id()}-label ${this.id()}-combobox`);

  /** @internal */
  readonly comboboxLabelId = computed(() => `${this.id()}-combobox`);

  /** @internal */
  readonly dropdownId = computed(() => this.id() + '-dropdown');

  /**
   * Value forwarded to the `aria-haspopup` attribute. Reflects the
   * `contentType` input of the registered {@link SiSelectDropdownDirective},
   * defaulting to `'listbox'` until a dropdown template is registered.
   * @internal
   */
  readonly haspopup = computed(() => this.dropdownDirective()?.contentType() ?? 'listbox');

  /**
   * This ID will be bound to the `aria-describedby` attribute of the select.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  /** Combined disabled state from input and form control. */
  readonly disabled = computed(() => this.disabledInput() || this.disabledByForm());

  private onTouched: () => void = () => {};

  private onChange: (_: T | undefined) => void = () => {};
  private readonly disabledByForm = signal(false);

  private readonly overlay = inject(Overlay);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private overlayRef?: OverlayRef;
  private focusTrap?: ConfigurableFocusTrap;
  private readonly closeOverlay$ = new Subject<void>();

  private readonly dropdownDirective = signal<SiSelectDropdownDirective | undefined>(undefined);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disposeOverlay();
      this.closeOverlay$.complete();
    });
  }

  /**
   * Registers the dropdown directive. Called by
   * {@link SiSelectDropdownDirective} when it is initialized.
   * @internal
   */
  registerDropdown(directive: SiSelectDropdownDirective): void {
    this.dropdownDirective.set(directive);
  }

  /**
   * Updates the value programmatically.
   * Call this from your dropdown template to set the new value.
   */
  updateValue(value: T | undefined): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** Opens the dropdown overlay. */
  open(event?: Event): void {
    if (this.disabled() || this.readonly() || this.isOpen() || !this.isBrowser) {
      return;
    }

    if (!this.dropdownDirective()) {
      return;
    }

    // Prevent default scrolling behavior for Space / ArrowUp / ArrowDown.
    event?.preventDefault();

    const width = this.elementRef.nativeElement.getBoundingClientRect().width;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          // Preferred: below, aligned to the start edge of the trigger.
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          // Below, aligned to the end edge (trigger near the end of the viewport).
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
          // Above, aligned to the start edge (no space below).
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
          // Above, aligned to the end edge (no space below, trigger near the end).
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
          // Below, centered (small screens, trigger in the middle).
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
          // Above, centered.
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }
        ])
        .withFlexibleDimensions(true)
        .withPush(true),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: ['dropdown-menu', 'show'],
      minWidth: width + 2
    });

    const portal = new TemplatePortal(this.dropdownDirective()!.templateRef, this.viewContainerRef);
    this.overlayRef.attach(portal);
    this.overlayRef.overlayElement.id = this.dropdownId();

    this.focusTrap = this.focusTrapFactory.create(this.overlayRef.overlayElement);
    this.focusTrap.focusFirstTabbableElementWhenReady();

    this.isOpen.set(true);
    this.openChange.emit(true);

    merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.keydownEvents().pipe(filter(e => e.key === 'Escape'))
    )
      .pipe(takeUntil(this.closeOverlay$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.close());
  }

  /** Closes the dropdown overlay and restores focus. */
  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.disposeOverlay();
    this.openChange.emit(false);
    this.onTouched();
    if (this.isBrowser) {
      this.elementRef.nativeElement.focus();
    }
  }

  /** @internal */
  writeValue(obj: T | null): void {
    this.value.set(obj ?? undefined);
  }

  /** @internal */
  registerOnChange(fn: (_: T | undefined) => void): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  private disposeOverlay(): void {
    if (this.overlayRef) {
      this.closeOverlay$.next();
      this.focusTrap?.destroy();
      this.focusTrap = undefined;
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }
}
