/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CDK_MENU } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

@Directive({
  host: {
    class: 'd-flex focus-inside',
    '[class.dropdown-item]': '!isInBar',
    '[class.disabled]': 'disabled()',
    '[class.btn]': 'isInBar',
    '[class.btn-icon]': 'isInBar',
    '[class.btn-tertiary]': 'isInBar',
    '[class.menu-bar-item]': 'isInBar'
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

  private readonly parentMenu = inject(CDK_MENU, { optional: true });

  protected get isInBar(): boolean {
    return this.parentMenu?.orientation === 'horizontal';
  }

  protected readonly badgeDotHasContent = computed(() => {
    return typeof this.iconBadgeDot() === 'string' || typeof this.iconBadgeDot() === 'number';
  });
}
