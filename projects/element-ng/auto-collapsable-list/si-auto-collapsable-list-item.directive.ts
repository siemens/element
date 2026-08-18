/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, booleanAttribute, computed, Directive, input, signal } from '@angular/core';

import { SiAutoCollapsableListMeasurable } from './si-auto-collapsable-list-measurable.class';

@Directive({
  selector: '[siAutoCollapsableListItem]',
  host: {
    '[class.visible]': 'isVisible()',
    '[class.invisible]': '!isVisible()',
    '[class.position-absolute]': '!isVisible()',
    // Ensure hidden items are behind the visible ones. Otherwise, the visible ones are not clickable
    '[class.z-n1]': '!isVisible()'
  },
  exportAs: 'siAutoCollapsableListItem'
})
export class SiAutoCollapsableListItemDirective
  extends SiAutoCollapsableListMeasurable
  implements AfterViewInit
{
  /**
   * Hide this item even if enough space is available.
   * When calculating the overall available size, this item is still considered when forceHide=true
   *
   * @defaultValue false
   */
  readonly forceHide = input(false, { transform: booleanAttribute });

  /**
   * True if enough space is available for this item.
   *
   * @defaultValue false
   */
  readonly canBeVisible = signal<boolean>(false);

  /**
   * True if this item is actually visible to the user
   */
  readonly isVisible = computed(() => this.canBeVisible() && !this.forceHide());

  ngAfterViewInit(): void {
    if (getComputedStyle(this.elementRef.nativeElement).display === 'inline') {
      console.error('siAutoCollapsibleListItem does not work on items with display="inline"');
    }
  }
}
