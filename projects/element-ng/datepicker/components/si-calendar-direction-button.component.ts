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
