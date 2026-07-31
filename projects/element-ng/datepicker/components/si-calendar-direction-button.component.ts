/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { elementLeft2, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

export type Direction = 'left' | 'right';

@Component({
  selector: 'si-calendar-direction-button',
  imports: [SiIconComponent],
  templateUrl: './si-calendar-direction-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiCalendarDirectionButtonComponent {
  /** Accessible label for the button. */
  readonly ariaLabel = input.required<string>();
  /**
   * Whether the button is disabled.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Direction in which the button navigates. */
  readonly direction = input<Direction>();

  /** Emits when the button is clicked. */
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
