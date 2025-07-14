/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, computed, Directive, input } from '@angular/core';

@Directive({
  host: {
    class: 'dropdown-item d-flex focus-inside',
    '[class.disabled]': 'disabled()'
  }
})
export abstract class SiMenuItemBase {
  readonly badge = input<string | number>();
  /**
   * @defaultValue 'secondary'
   */
  readonly badgeColor = input('secondary');
  readonly icon = input<string>();

  /** @defaultValue false */
  readonly iconBadgeDot = input<boolean | string | number | undefined>(false);

  /** @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly badgeDotHasContent = computed(() => {
    return typeof this.iconBadgeDot() === 'string' || typeof this.iconBadgeDot() === 'number';
  });
}
