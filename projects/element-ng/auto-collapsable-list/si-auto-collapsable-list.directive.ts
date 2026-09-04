/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  INJECTOR,
  input,
  OnChanges,
  SimpleChanges,
  untracked
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { observeElementSize } from '@siemens/element-ng/resize-observer';
import { Subscription } from 'rxjs';

import { SiAutoCollapsableListAdditionalContentDirective } from './si-auto-collapsable-list-additional-content.directive';
import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListOverflowItemDirective } from './si-auto-collapsable-list-overflow-item.directive';

/** An item is only usable for the calculation once its size has been measured. */
interface MeasuredItem {
  size: number;
  directive: SiAutoCollapsableListItemDirective;
}

const isMeasured = (item: {
  size: number | undefined;
  directive: SiAutoCollapsableListItemDirective;
}): item is MeasuredItem => item.size !== undefined;

const isDefined = (size: number | undefined): size is number => size !== undefined;

@Directive({
  selector: '[siAutoCollapsableList]',
  host: {
    class: 'position-relative',
    '[class.overflow-hidden]': 'siAutoCollapsableList()'
  },
  exportAs: 'siAutoCollapsableList'
})
export class SiAutoCollapsableListDirective implements AfterViewInit, OnChanges {
  private readonly elementRef = inject(ElementRef);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(INJECTOR);
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
   * The (flex) gap in pixels, will automatically be set if a pixel value is used in CSS.
   */
  readonly gap = input<number>();

  /**
   * The element which size is available for the content of the siAutoCollapsableList.
   *
   * @defaultValue undefined
   */
  readonly containerElement = input<HTMLElement | undefined | null>(undefined, {
    alias: 'siAutoCollapsableListContainerElement'
  });

  private disableInitSubscription?: Subscription;
  private readonly container = computed(
    () => this.containerElement() ?? this.elementRef.nativeElement
  );
  private readonly containerEntry = observeElementSize(this.container);
  private readonly containerSize = computed(
    () => this.containerEntry()?.contentBoxSize[0].inlineSize
  );
  private readonly itemSizes = computed(() =>
    this.items().map(item => ({
      size: item.inlineSize(),
      directive: item
    }))
  );
  /**
   * The same as {@link gap}, but automatically read from the computed styles.
   * Used if not set by user.
   */
  private computedGap = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.disableInitSubscription?.unsubscribe());
    effect(() => {
      if (!this.siAutoCollapsableList()) {
        return;
      }
      const containerSize = this.containerSize();
      const itemSizes = this.itemSizes();
      const additionalContentSizes = this.additionalContent().map(item => item.inlineSize());
      const overflowItem = this.overflowItem();
      const overflowItemSize = overflowItem ? overflowItem.inlineSize() : 0;
      const gap = this.gap() ?? this.computedGap;
      // Ignore changes until all items are measured, otherwise wo  would latch the list into a wrong state.
      // Size the items influence the size of the observed container.
      if (
        containerSize === undefined ||
        overflowItemSize === undefined ||
        !itemSizes.every(isMeasured) ||
        !additionalContentSizes.every(isDefined)
      ) {
        return;
      }

      untracked(() =>
        this.updateItemVisibility(
          containerSize,
          overflowItemSize,
          itemSizes,
          additionalContentSizes,
          gap
        )
      );
    });
  }

  ngAfterViewInit(): void {
    this.readGapSize();
    if (!this.siAutoCollapsableList()) {
      this.reset();
    }
  }

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.siAutoCollapsableList) {
      if (this.siAutoCollapsableList()) {
        // Stop forcing every item to be visible, the effect takes over again.
        this.disableInitSubscription?.unsubscribe();
        this.disableInitSubscription = undefined;
      } else {
        this.reset();
      }
    }
  }

  private updateItemVisibility(
    containerSize: number,
    overflowItemSize: number,
    items: MeasuredItem[],
    additionalContent: number[],
    gap: number
  ): void {
    let remainingSpace = containerSize - additionalContent.reduce((a, b) => a + b, 0);

    const itemsRemaining = items.slice();
    let hiddenItemCount = 0;

    while (remainingSpace > 0 && itemsRemaining.length) {
      const item = itemsRemaining.shift()!;
      if (remainingSpace - item.size - gap - overflowItemSize >= 0) {
        // There is space for the item and an overflow item.
        item.directive.canBeVisible.set(true);
        remainingSpace -= item.size + gap;
      } else if (
        !itemsRemaining.length &&
        (remainingSpace - item.size >= 0 || overflowItemSize >= item.size)
      ) {
        // There are no other items remaining and there is enough space or the overflow item is biggger than the current one.
        item.directive.canBeVisible.set(true);
        remainingSpace = 0;
      } else {
        // There is no space for the item.
        remainingSpace = 0;
        item.directive.canBeVisible.set(false);
        hiddenItemCount++;
      }
    }
    itemsRemaining.forEach(item => {
      item.directive.canBeVisible.set(false);
      hiddenItemCount++;
    });

    const overflowItem = this.overflowItem();
    if (overflowItem) {
      overflowItem.hiddenItemCount = hiddenItemCount;
      overflowItem.canBeVisible.set(hiddenItemCount !== 0);
    }
    this.cdRef.markForCheck();
  }

  private reset(): void {
    this.disableInitSubscription?.unsubscribe();
    this.disableInitSubscription = toObservable(this.items, { injector: this.injector }).subscribe(
      items =>
        queueMicrotask(() => {
          items.forEach(item => item.canBeVisible.set(true));
        })
    );

    const overflowItem = this.overflowItem();
    if (overflowItem) {
      queueMicrotask(() => {
        overflowItem.canBeVisible.set(false);
        overflowItem.hiddenItemCount = 0;
      });
    }
  }

  private readGapSize(): void {
    const { gap } = getComputedStyle(this.elementRef.nativeElement);
    if (gap.endsWith('px') || gap === '0') {
      this.computedGap = parseFloat(gap);
    }
  }
}
