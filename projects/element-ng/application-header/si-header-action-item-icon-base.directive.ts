/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { SiHeaderActionItemBase } from './si-header-action-item.base';

/**
 * Base for icon based actions.
 * @internal
 */
@Directive({})
export abstract class SiHeaderActionIconItemBase
  extends SiHeaderActionItemBase
  implements OnChanges, OnInit
{
  /**
   * Adds a badge to the header item.
   * If type
   * - =number, the number will be shown and automatically trimmed if \>99
   * - =true, an empty red dot will be shown
   */
  readonly badge = input<number | boolean | undefined | null>();

  protected readonly badgeDot = computed(() =>
    typeof this.badge() === 'boolean' ? (this.badge() as boolean) : false
  );
  protected readonly badgeValue = computed(() => {
    const badge = this.badge();
    return typeof badge === 'number'
      ? `${badge > 99 ? '+' : ''}${Math.min(99, Math.round(badge))}`
      : undefined;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('badge' in changes) {
      if (changes.badge.currentValue && !changes.badge.previousValue) {
        this.collapsibleActions?.badgeCount.update(count => count + 1);
      } else if (!changes.badge.currentValue && changes.badge.previousValue) {
        this.collapsibleActions?.badgeCount.update(count => count - 1);
      }
    }
  }

  protected get visuallyHideTitle(): boolean {
    return !this.collapsibleActions?.mobileExpanded();
  }
}
