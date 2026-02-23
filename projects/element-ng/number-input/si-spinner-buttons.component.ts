/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  OnInit,
  signal
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { addIcons, elementMinus, elementPlus, SiIconNextComponent } from '@siemens/element-ng/icon';
import { Subscription, timer } from 'rxjs';

import { SiNumberInputDirective } from './si-number-input.directive';

@Component({
  selector: 'si-spinner-buttons',
  imports: [SiIconNextComponent],
  template: `
    <ng-content select="input" />
    @if (unit()) {
      <span
        class="unit ms-2"
        [class.text-secondary]="!numberInput().disabled()"
        [class.text-disabled]="numberInput().disabled()"
        >{{ unit() }}</span
      >
    } @else {
      <!-- To reserve space for feedback icon -->
      <span class="unit"></span>
    }
    @if (showButtons()) {
      <button
        type="button"
        tabindex="-1"
        aria-hidden="true"
        class="dec btn btn-circle btn-tertiary btn-xs my-n3 ms-2"
        [disabled]="numberInput().disabled() || numberInput().readonly() || !canDec()"
        (mousedown)="autoUpdateStart($event, false)"
        (touchstart)="autoUpdateStart($event, false)"
        (touchend)="autoUpdateStop()"
        (mouseup)="autoUpdateStop()"
        (mouseleave)="autoUpdateStop()"
      >
        <si-icon-next [icon]="icons.elementMinus" />
      </button>
      <button
        type="button"
        tabindex="-1"
        aria-hidden="true"
        class="inc btn btn-circle btn-tertiary btn-xs my-n3 me-n2"
        [disabled]="numberInput().disabled() || numberInput().readonly() || !canInc()"
        (mousedown)="autoUpdateStart($event, true)"
        (touchstart)="autoUpdateStart($event, true)"
        (touchend)="autoUpdateStop()"
        (mouseup)="autoUpdateStop()"
        (mouseleave)="autoUpdateStop()"
      >
        <si-icon-next [icon]="icons.elementPlus" />
      </button>
    }
  `,
  styleUrl: './si-number-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.show-step-buttons]': 'showButtons()',
    '[class.disabled]': 'numberInput().disabled()',
    '[class.readonly]': 'numberInput().readonly()',
    '[class.ng-invalid]': 'ngControl().invalid',
    '[class.ng-pristine]': 'ngControl().pristine',
    '[class.ng-touched]': 'ngControl().touched',
    '[class.ng-untouched]': 'ngControl().untouched',
    '[class.ng-valid]': 'ngControl().valid'
  }
})
export class SiSpinnerButtonsComponent implements OnInit {
  /**
   * Show increment/decrement buttons?
   *
   * @defaultValue true
   */
  readonly showButtons = input(true, { transform: booleanAttribute });
  /** Optional unit label */
  readonly unit = input<string>();
  protected readonly ngControl = contentChild.required(NgControl, { descendants: true });
  protected readonly numberInput = contentChild.required(SiNumberInputDirective, {
    descendants: true
  });
  protected readonly icons = addIcons({ elementMinus, elementPlus });
  protected readonly canDec = computed(() => {
    const v = this.value();
    return v === undefined || v > (this.numberInput()?.min() ?? Infinity);
  });
  protected readonly canInc = computed(() => {
    const v = this.value();
    return v === undefined || v < (this.numberInput()?.max() ?? Infinity);
  });
  protected readonly value = signal<number | undefined>(undefined);
  private autoUpdate$ = timer(400, 80);
  private autoUpdateSubs?: Subscription;

  ngOnInit(): void {
    this.numberInput().valueChange.subscribe(v => this.value.set(v));
  }

  protected autoUpdateStart(event: Event, isIncrement: boolean): void {
    const mouseButton = (event as MouseEvent).button;
    if (mouseButton) {
      return;
    }

    event.preventDefault();
    const trigger = isIncrement
      ? () => this.numberInput().increment()
      : () => this.numberInput().decrement();
    this.autoUpdateSubs?.unsubscribe();
    this.autoUpdateSubs = this.autoUpdate$.subscribe(trigger);
    trigger();
  }

  protected autoUpdateStop(): void {
    this.autoUpdateSubs?.unsubscribe();
    this.autoUpdateSubs = undefined;
  }
}
