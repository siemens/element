/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';

@Directive({
  selector: '[siAutoCollapsableListOverflowItem]',
  exportAs: 'siAutoCollapsableListOverflowItem'
})
export class SiAutoCollapsableListOverflowItemDirective extends SiAutoCollapsableListItemDirective {
  /**
   * Number of hidden items.
   *
   * @defaultValue 0
   */
  hiddenItemCount = 0;
}
