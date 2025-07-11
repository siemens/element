/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import {
  addIcons,
  elementLeft2,
  elementRight2,
  SiIconNextComponent
} from '@siemens/element-ng/icon';

export type Direction = 'left' | 'right';

@Component({
  selector: 'si-calendar-direction-button',
  imports: [NgClass, SiIconNextComponent],
  template: `<button
    role="button"
    type="button"
    class="btn btn-circle btn-sm btn-tertiary"
    [ngClass]="buttonClass()"
    [disabled]="disabled() || null"
    [attr.aria-label]="ariaLabel()"
    (click)="onClick()"
  >
    <si-icon-next class="icon flip-rtl" [icon]="icon()" />
  </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiCalendarDirectionButtonComponent {
  readonly ariaLabel = input.required<string>();
  /** @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly direction = input<Direction>();

  /**
   * Emit on button click.
   */
  readonly clicked = output();

  protected readonly icon = computed(() =>
    this.direction() === 'left' ? this.icons.elementLeft2 : this.icons.elementRight2
  );
  protected readonly buttonClass = computed(() =>
    this.direction() === 'left' ? 'previous-button' : 'next-button'
  );

  protected readonly icons = addIcons({ elementLeft2, elementRight2 });

  protected onClick(): void {
    this.clicked.emit();
  }
}
