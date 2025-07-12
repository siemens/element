/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, Component, computed, input, numberAttribute } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-icon-status',
  imports: [NgClass, SiIconNextComponent],
  templateUrl: './si-icon-status.component.html',
  styleUrl: './si-icon-status.component.scss'
})
export class SiIconStatusComponent {
  /** Icon to display. */
  readonly icon = input.required<string>();
  /** Stacked icon to display. */
  readonly stackedIcon = input<string>();
  /**
   * Counter below the icon
   *
   * @defaultValue 0
   */
  readonly count = input(0, { transform: numberAttribute });
  /** Color of the icon */
  readonly color = input<string>();
  /**
   * Whether the icon is disabled.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly isDisabledOrCountZero = computed(() => !!this.disabled() || this.count() === 0);
}
