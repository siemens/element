/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  contentChild,
  ContentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges
} from '@angular/core';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { BehaviorSubject, combineLatest, of, Subscription } from 'rxjs';
import { auditTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';

import { SiAutoCollapsableListAdditionalContentDirective } from './si-auto-collapsable-list-additional-content.directive';
import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListOverflowItemDirective } from './si-auto-collapsable-list-overflow-item.directive';

@Directive({
  selector: '[siAutoCollapsableList]',
  exportAs: 'siAutoCollapsableList',
  host: {
    style: 'position: relative',
    '[style.overflow]': 'siAutoCollapsableList() ? "hidden" : ""'
  }
})
export class SiAutoCollapsableListDirective implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * The items which are displayed in the siAutoCollapsableList.
   */
  @ContentChildren(SiAutoCollapsableListItemDirective)
  items!: QueryList<SiAutoCollapsableListItemDirective>;

  private readonly overflowItem = contentChild(SiAutoCollapsableListOverflowItemDirective);

  @ContentChildren(SiAutoCollapsableListAdditionalContentDirective)
  private additionalContent!: QueryList<SiAutoCollapsableListAdditionalContentDirective>;

  /** @defaultValue true */
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

  private resizeSubscription?: Subscription;
  private disableInitSubscription?: Subscription;
  private readonly elementRef = inject(ElementRef);
  private readonly resizeObserverService = inject(ResizeObserverService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly containerElementSubject = new BehaviorSubject<HTMLElement | null>(
    this.elementRef.nativeElement
  );

  /**
   * The same as {@link gap}, but automatically read from the computed styles.
   * Used if not set by user.
   */
  private computedGap = 0;

  ngAfterViewInit(): void {
    if (this.siAutoCollapsableList()) {
      this.readGapSize();
      this.setupResizeListener();
    } else {
      this.reset();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.siAutoCollapsableList) {
      const siAutoCollapsableList = this.siAutoCollapsableList();
      if (!siAutoCollapsableList && this.resizeSubscription) {
        this.reset();
      } else if (siAutoCollapsableList && !this.resizeSubscription && this.items) {
        this.setupResizeListener();
      }
    }

    if (changes.containerElement) {
      this.containerElementSubject.next(this.containerElement() ?? this.elementRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
    this.disableInitSubscription?.unsubscribe();
    this.containerElementSubject.complete();
  }

  private setupResizeListener(): void {
    this.disableInitSubscription?.unsubscribe();
    const containerSize$ = this.containerElementSubject.pipe(
      switchMap(element => this.resizeObserverService.observe(element!, 0, true, true)),
      map(size => size.width),
      distinctUntilChanged(),
      map(size => {
        const { paddingInlineStart, paddingInlineEnd } = getComputedStyle(
          this.containerElement() ?? this.elementRef.nativeElement
        );
        return size - parseFloat(paddingInlineStart) - parseFloat(paddingInlineEnd);
      })
    );

    const itemSizes$ = this.items.changes.pipe(
      startWith(this.items),
      switchMap((items: QueryList<SiAutoCollapsableListItemDirective>) =>
        !items.length
          ? of([])
          : combineLatest(
              items.map(item =>
                item.size$.pipe(
                  map(size => ({
                    size,
                    directive: item
                  }))
                )
              )
            )
      )
    );
    const additionalContentSizes$ = this.additionalContent.changes.pipe(
      startWith(this.additionalContent),
      switchMap((additionalContent: QueryList<SiAutoCollapsableListAdditionalContentDirective>) =>
        combineLatest(additionalContent.map(item => item.size$))
      ),
      startWith([])
    );

    this.resizeSubscription = combineLatest([
      containerSize$,
      this.overflowItem()?.size$ ?? of(0),
      itemSizes$,
      additionalContentSizes$
    ])
      .pipe(auditTime(0))
      .subscribe(([containerSize, overflowItemSize, items, additionalContentSizes]) =>
        this.updateItemVisibility(containerSize, overflowItemSize, items, additionalContentSizes)
      );
  }

  private updateItemVisibility(
    containerSize: number,
    overflowItemSize: number,
    items: { size: number; directive: SiAutoCollapsableListItemDirective }[],
    additionalContent: number[]
  ): void {
    let remainingSpace = containerSize - additionalContent.reduce((a, b) => a + b, 0);

    const itemsRemaining = items.slice();

    const gap = this.gap() ?? this.computedGap;

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
      }
    }
    itemsRemaining.forEach(item => item.directive.canBeVisible.set(false));

    const overflowItem = this.overflowItem();
    if (overflowItem) {
      overflowItem.hiddenItemCount = this.items.filter(item => !item.canBeVisible()).length;
      overflowItem.canBeVisible.set(overflowItem.hiddenItemCount !== 0);
    }
    this.changeDetectorRef.markForCheck();
  }

  private reset(): void {
    this.resizeSubscription?.unsubscribe();
    this.resizeSubscription = undefined;
    this.disableInitSubscription = this.items.changes.subscribe(
      (items: QueryList<SiAutoCollapsableListItemDirective>) =>
        queueMicrotask(() => {
          items.forEach(item => item.canBeVisible.set(true));
        })
    );
    this.items.notifyOnChanges();

    const overflowItem = this.overflowItem();
    if (overflowItem) {
      queueMicrotask(() => {
        overflowItem!.canBeVisible.set(false);
        overflowItem!.hiddenItemCount = 0;
      });
    }
  }

  private readGapSize(): void {
    const { gap } = getComputedStyle(this.containerElement() ?? this.elementRef.nativeElement);
    if (gap.endsWith('px') || gap === '0') {
      this.computedGap = parseFloat(gap);
    }
  }
}
