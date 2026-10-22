/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive } from '@angular/core';

import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';

@Directive({
  selector: '[siAutoCollapsableListOverflowItem]',
  exportAs: 'siAutoCollapsableListOverflowItem'
})
export class SiAutoCollapsableListOverflowItemDirective extends SiAutoCollapsableListItemDirective {
  /** True if any list items do not fit in the available space. */
  override readonly canBeVisible = computed(() => this.hiddenItemCount() > 0);

  /**
   * Number of hidden items.
   *
   * @defaultValue 0
   */
  readonly hiddenItemCount = computed(() => this.list.hiddenItemCount());
}
