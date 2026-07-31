/**
 * Copyright (c) Siemens 2016 - 2026
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
  /** Content displayed in the menu item's badge. */
  readonly badge = input<string | number>();
  /**
   * Color variant of the menu item's badge.
   *
   * @defaultValue 'secondary'
   */
  readonly badgeColor = input('secondary');
  /** Icon displayed before the menu item label. */
  readonly icon = input<string>();

  /**
   * Whether to show a dot badge on the icon. A string or number is shown as dot content.
   *
   * @defaultValue false
   */
  readonly iconBadgeDot = input<boolean | string | number | undefined>(false);

  /**
   * Whether the menu item is disabled.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly badgeDotHasContent = computed(() => {
    return typeof this.iconBadgeDot() === 'string' || typeof this.iconBadgeDot() === 'number';
  });
}
