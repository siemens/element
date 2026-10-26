/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input
} from '@angular/core';
import { observeSize } from '@siemens/element-ng/resize-observer';

import { SiAutoCollapsableListAdditionalContentDirective } from './si-auto-collapsable-list-additional-content.directive';
import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListOverflowItemDirective } from './si-auto-collapsable-list-overflow-item.directive';
import { SI_AUTO_COLLAPSABLE_LIST } from './si-auto-collapsable-list.token';

@Directive({
  selector: '[siAutoCollapsableList]',
  providers: [{ provide: SI_AUTO_COLLAPSABLE_LIST, useExisting: SiAutoCollapsableListDirective }],
  host: {
    class: 'position-relative',
    '[class.overflow-hidden]': 'siAutoCollapsableList()'
  },
  exportAs: 'siAutoCollapsableList'
})
export class SiAutoCollapsableListDirective {
  /**
   * The items which are displayed in the siAutoCollapsableList.
   */
  readonly items = contentChildren(SiAutoCollapsableListItemDirective);

  private readonly overflowItem = contentChild(SiAutoCollapsableListOverflowItemDirective);
  private readonly additionalContent = contentChildren(
    SiAutoCollapsableListAdditionalContentDirective
  );

  /**
   * Enables the auto-collapsing behavior. When `true`, items that overflow the container
   * are hidden and an overflow indicator item is shown instead.
   *
   * @defaultValue true
   */
  readonly siAutoCollapsableList = input(true, { transform: booleanAttribute });

  /**
   * The (flex) gap in pixels. Defaults to the container's computed column gap.
   */
  readonly gap = input<number>();

  /**
   * The element whose size is available for the content of the siAutoCollapsableList.
   *
   * @defaultValue undefined
   */
  readonly containerElement = input<HTMLElement | undefined | null>(undefined, {
    alias: 'siAutoCollapsableListContainerElement'
  });

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly container = computed(
    () => this.containerElement() ?? this.elementRef.nativeElement
  );
  private readonly containerSize = observeSize(
    () => (this.siAutoCollapsableList() ? this.container() : undefined),
    { throttle: 0 }
  );

  /** Items that fit in the available space, before applying each item's forceHide input. */
  readonly visibleItems = computed<ReadonlySet<SiAutoCollapsableListItemDirective>>(() => {
    const items = this.items();
    const visibleCount = this.siAutoCollapsableList()
      ? this.measureVisibleCount(items, this.overflowItem())
      : items.length;
    return new Set(items.slice(0, visibleCount));
  });

  /** Number of items hidden because they do not fit in the available space. */
  readonly hiddenItemCount = computed(() => this.items().length - this.visibleItems().size);

  private measureVisibleCount(
    items: readonly SiAutoCollapsableListItemDirective[],
    overflowItem: SiAutoCollapsableListOverflowItemDirective | undefined
  ): number {
    const width = this.containerSize()?.width ?? 0;
    const { paddingInlineStart, paddingInlineEnd, columnGap } = getComputedStyle(this.container());
    const gap = this.gap() ?? (parseFloat(columnGap) || 0);
    const additionalContent = this.additionalContent();
    const availableSpace =
      width -
      (parseFloat(paddingInlineStart) || 0) -
      (parseFloat(paddingInlineEnd) || 0) -
      additionalContent.reduce((total, item) => total + item.size() + gap, 0);
    const sizes = items.map(item => item.size());
    const totalSize = sizes.reduce((total, size) => total + size, 0);

    // No space needs to be reserved for the overflow indicator if all items fit.
    if (totalSize + Math.max(0, items.length - 1) * gap <= availableSpace) {
      return items.length;
    }

    const overflowSize = overflowItem ? overflowItem.size() + gap : 0;
    let usedSpace = 0;
    let visibleCount = 0;
    for (const size of sizes) {
      const nextSize = usedSpace + (visibleCount ? gap : 0) + size;
      if (nextSize + overflowSize > availableSpace) {
        break;
      }
      usedSpace = nextSize;
      visibleCount++;
    }
    return visibleCount;
  }
}
