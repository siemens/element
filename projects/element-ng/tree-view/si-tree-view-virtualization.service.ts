/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { ItemsVirtualizedArgs, TreeItem } from './si-tree-view.model';
import { SiTreeViewService } from './si-tree-view.service';

/**
 * Provides helper functionality to virtualize a list of items.
 * The number of virtualized items is the product of the pageSize and the pagesVirtualized (no of pages virtualized);
 * The paging algorithm works as follows:
 * If scrolling down, between two and three pages are kept above the 'visible' area;
 * The trigger is therefore if more than three pages are above the visible area, one page is removed from the top and added at the bottom.
 * If scrolling up, between one and two pages are kept above the 'visible' area;
 * The trigger is therefore if less than one page is above the visible area, one page is added on top and removed from the bottom.
 * All remaining items which are not virtualized, need to be simulated with two div-elements whose height can be set with the calculated
 * properties heightBefore and heightAfter.
 * See the test client for further information on the  usage.
 * Constraint:
 * The virtualization calculation works correct only when all list items are of the same height!
 * If the 'group' mode is enabled, the corresponding group-items can have a different height, but for all group-items it must be the same.
 */
@Injectable()
export class SiTreeViewVirtualizationService {
  /**
   * The number of list items of a virtualized page.
   * Choose a value, which is roughly half of the number of items you expect to be displayed on the visible screen.
   *
   * @defaultValue 10
   */
  pageSize = 10;
  /**
   * The number of pages to be virtualized.
   *
   * @defaultValue 6
   */
  pagesVirtualized = 6;
  /**
   * Emits when the virtualized items have changed (added/removed).
   */
  itemsVirtualizedChanged: Subject<ItemsVirtualizedArgs> = new Subject<ItemsVirtualizedArgs>();
  /**
   * The total height of the 'simulated' list items which are ordered before the virtualized list items.
   */
  private _heightBefore = 0;
  /**
   * The total height of the 'simulated' list items which are ordered after the virtualized list items.
   */
  private _heightAfter = 0;
  private _pageBase = 0;
  private scrollTopPrev = 0;
  private _itemsVirtualized: TreeItem[] = [];
  private groupItemsCountBefore = 0;
  private listItemsCountBefore = 0;
  private groupItemsCountAfter = 0;
  private listItemsCountAfter = 0;
  private groupItemsCountVirtualized = 0;
  private listItemsCountVirtualized = 0;
  private listItemsPerVirtPage: number[] = [];
  private groupItemsPerVirtPage: number[] = [];

  private siTreeViewService = inject(SiTreeViewService);
  private siTreeViewItemHeightService = inject(SiTreeViewItemHeightService);

  /**
   * Returns the virtualized items.
   */
  get itemsVirtualized(): TreeItem[] {
    return this._itemsVirtualized;
  }

  /**
   * The total height of the 'simulated' list items which are ordered before the virtualized list items.
   */
  get heightBefore(): number {
    return this._heightBefore;
  }

  /**
   * The total height of the 'simulated' list items which are ordered after the virtualized list items.
   */
  get heightAfter(): number {
    return this._heightAfter;
  }

  /**
   * The index of the first (base) page being virtualized.
   */
  get pageBase(): number {
    return this._pageBase;
  }

  /**
   * The list item index of the base page.
   */
  get itemBaseIdx(): number {
    return this._pageBase * this.pageSize;
  }

  /**
   * Returns the number of virtualized items.
   */
  get itemsVirtualizedCount(): number {
    return this.itemsVirtualized.length;
  }

  /**
   * Call this method upon scroll handler notifications!
   *
   * @param scrollTop - the scrollTop value retrieved form the event target
   * @param itemsAll - all items of the list
   */
  handleScroll(scrollTop: number, itemsAll: TreeItem[]): void {
    if (this.siTreeViewService.groupedList) {
      this.handleScrollGrouped(scrollTop, itemsAll);
    } else {
      this.handleScrollSimple(scrollTop, itemsAll);
    }
  }

  /**
   * Resets the virtualization to 'show' the items of the first page onwards.
   */
  resetVirtualizedItemList(itemsAll: TreeItem[]): void {
    this._pageBase = 0;
    this.updateVirtualizedItemListIntern(itemsAll);
  }

  /**
   * Updates the virtualized items. Call this method for use cases such as:
   * - The list items array contains added or removed items which could be in the 'visible' area
   * - The item height has changed.
   */
  updateVirtualizedItemList(itemsAll: TreeItem[]): void {
    this.updateVirtualizedItemListIntern(itemsAll);
  }

  /**
   * Checks if the specified item is currently virtualized.
   * If not, the virtualization is recalculated in order that the item is part of the virtualized items.
   */
  virtualizeItem(item: TreeItem, itemsAll: TreeItem[]): void {
    if (this.checkIfItemDisplayed(item) === false) {
      this.setBasePageForItemToDisplay(item, itemsAll);
    }
  }

  /**
   * Calculates the first visible tree item based on current scroll position.
   */
  calculateFirstVisibleTreeItem(): TreeItem | undefined {
    let item: TreeItem | undefined;
    let totalItemHeight = 0;
    // Approx Y-position of the middle of the first visible (top) tree item
    const topItemPos =
      this.scrollTopPrev +
      (this.siTreeViewItemHeightService.itemHeight ?? 0) / 2 -
      this.heightBefore;
    for (let idx = 0; idx < this._itemsVirtualized.length && totalItemHeight < topItemPos; idx++) {
      item = this._itemsVirtualized[idx];
      totalItemHeight += this.isGroupItem(item)
        ? (this.siTreeViewItemHeightService.groupItemHeight ?? 0)
        : (this.siTreeViewItemHeightService.itemHeight ?? 0);
    }
    return item;
  }

  private get listItemsCountTotal(): number {
    return this.listItemsCountBefore + this.listItemsCountVirtualized + this.listItemsCountAfter;
  }

  private get groupItemsCountTotal(): number {
    return this.groupItemsCountBefore + this.groupItemsCountVirtualized + this.groupItemsCountAfter;
  }

  private get itemsCountTotal(): number {
    return this.listItemsCountTotal + this.groupItemsCountTotal;
  }

  private get itemsCountVirtualizedMax(): number {
    return this.pageSize * this.pagesVirtualized;
  }

  private updateVirtualizedItemListIntern(itemsAll: TreeItem[], scrolledPages?: number): void {
    // Note!!!:
    // The order of functionality within this method must be maintained as state of this object is changed!!!

    const itemsVirtualizedOld: TreeItem[] = this._itemsVirtualized.slice();

    this._itemsVirtualized = itemsAll.slice(
      this.pageBase * this.pageSize,
      this.itemsCountVirtualizedMax + this.pageBase * this.pageSize
    );

    this.updateItemsTypeCount(itemsAll, scrolledPages);

    if (this.siTreeViewService.groupedList) {
      this.calculateBeforeAndAfterForGroupList();
    } else {
      this.calculateBeforeAndAfter();
    }

    this.maintainVirtualizationNotifies(itemsVirtualizedOld);
  }

  /**
   * Notifies a consumer about changes of virtualized tree/list items in case of a pageBase change.
   * One notification is sent for every tree/list item
   * that went out of the virtualized items list or came into the virtualized items.
   */
  private maintainVirtualizationNotifies(itemsVirtualizedOld: TreeItem[]): void {
    const itemsAdded: TreeItem[] = [];
    const itemsRemoved: TreeItem[] = [];
    for (const item of itemsVirtualizedOld) {
      if (!this._itemsVirtualized.includes(item)) {
        itemsRemoved.push(item);
      }
    }
    for (const item of this._itemsVirtualized) {
      if (!itemsVirtualizedOld.includes(item)) {
        itemsAdded.push(item);
      }
    }
    if (itemsRemoved.length > 0) {
      this.itemsVirtualizedChanged.next(new ItemsVirtualizedArgs(itemsRemoved, false));
    }
    if (itemsAdded.length > 0) {
      this.itemsVirtualizedChanged.next(new ItemsVirtualizedArgs(itemsAdded, true));
    }
  }

  private calculateBasePage(idx: number): void {
    this._pageBase = Math.floor(idx / this.pageSize - this.pagesVirtualized / 2);
    if (this.pageBase < 0) {
      this._pageBase = 0;
    }
  }

  /**
   * Calculates the height [px] for the divs before and after the tree list in case of 'grouped' mode!
   */
  private calculateBeforeAndAfterForGroupList(): void {
    const groupItemHeight = this.siTreeViewItemHeightService.groupItemHeight ?? 0;
    const listItemHeight = this.siTreeViewItemHeightService.itemHeight ?? 0;

    const scrollHeight =
      this.listItemsCountTotal * listItemHeight + this.groupItemsCountTotal * groupItemHeight;

    this._heightBefore =
      this.listItemsCountBefore * listItemHeight + this.groupItemsCountBefore * groupItemHeight;

    this._heightAfter =
      scrollHeight -
      this.heightBefore -
      (this.listItemsCountVirtualized * listItemHeight +
        this.groupItemsCountVirtualized * groupItemHeight);
  }

  /**
   * Calculates the height [px] for the divs before and after the tree list in case of 'non-grouped' mode!
   */
  private calculateBeforeAndAfter(): void {
    if (
      this.siTreeViewItemHeightService.itemHeight === undefined ||
      this.siTreeViewItemHeightService.itemHeight === 0
    ) {
      return;
    }
    const scrollHeight: number = this.itemsCountTotal * this.siTreeViewItemHeightService.itemHeight;

    this._heightBefore =
      this.pageBase * this.pageSize * this.siTreeViewItemHeightService.itemHeight;
    this._heightAfter =
      scrollHeight -
      this.heightBefore -
      this.itemsVirtualizedCount * this.siTreeViewItemHeightService.itemHeight;
  }

  private checkIfItemDisplayed(currentItem: TreeItem): boolean {
    for (const item of this._itemsVirtualized) {
      if (item === currentItem) {
        return true;
      }
    }
    return false;
  }

  private setBasePageForItemToDisplay(item: TreeItem, itemsAll: TreeItem[]): void {
    for (let i = 0; i < itemsAll.length; i++) {
      if (itemsAll[i] === item) {
        this.calculateBasePage(i);
        this.updateVirtualizedItemListIntern(itemsAll);
        return;
      }
    }
  }

  /**
   * Updates the number of grouped items and list items for the whole list for the different areas:
   * - The not virtualized items on top of the list (represented by the 'beforeHeight')
   * - The virtualized items
   * - The not virtualized items on the bottom of the list (represented by the 'afterHeight')
   */
  private updateItemsTypeCount(itemsAll: TreeItem[], scrolledPages?: number): void {
    if (this.siTreeViewService.groupedList) {
      this.updateItemsTypeCountForGroupList(itemsAll, scrolledPages);
    } else {
      this.groupItemsCountBefore = 0;
      this.groupItemsCountVirtualized = 0;
      this.groupItemsCountAfter = 0;
      this.listItemsCountBefore = this.itemBaseIdx;
      this.listItemsCountVirtualized = this.itemsVirtualizedCount;
      this.listItemsCountAfter =
        itemsAll.length - this.listItemsCountBefore - this.listItemsCountVirtualized;
    }
    this.updateItemsTypeCountPerVirtPage();

    if (this.itemsCountTotal !== itemsAll.length) {
      console.error(
        'TreeListVirtualizationService: updateVirtualizedItemList().updateListItemsTypeCount() calculation error!'
      );
    }
  }

  /**
   * Updates the number of grouped items and list items per virtualized page.
   */
  private updateItemsTypeCountPerVirtPage(): void {
    this.listItemsPerVirtPage = [];
    this.groupItemsPerVirtPage = [];
    for (let basePgIdx = 0; basePgIdx < this.pagesVirtualized; basePgIdx++) {
      const baseIdx: number = basePgIdx * this.pageSize;
      let groupItemsCount = 0;
      let listItemsCount = 0;
      for (let idx: number = baseIdx; idx < baseIdx + this.pageSize; idx++) {
        if (idx < this.itemsVirtualized.length) {
          const item: TreeItem = this.itemsVirtualized[idx];
          if (this.isGroupItem(item)) {
            groupItemsCount++;
          } else {
            listItemsCount++;
          }
        } else {
          break;
        }
      }
      this.listItemsPerVirtPage.push(listItemsCount);
      this.groupItemsPerVirtPage.push(groupItemsCount);
    }
  }

  private calculateVirtPageHeight(index: number): number {
    if (index >= this.groupItemsPerVirtPage.length) {
      return 0;
    }

    if (this.siTreeViewService.groupedList) {
      if (this.siTreeViewItemHeightService.itemHeight !== undefined) {
        return (
          this.listItemsPerVirtPage[index] * this.siTreeViewItemHeightService.itemHeight +
          this.groupItemsPerVirtPage[index] *
            (this.siTreeViewItemHeightService.groupItemHeight ?? 0)
        );
      } else {
        return (
          this.groupItemsPerVirtPage[index] *
          (this.siTreeViewItemHeightService.groupItemHeight ?? 0)
        );
      }
    } else {
      return this.listItemsPerVirtPage[index] * (this.siTreeViewItemHeightService.itemHeight ?? 0);
    }
  }

  private updateItemsTypeCountForGroupList(itemsAll: TreeItem[], scrolledPages?: number): void {
    if (scrolledPages !== undefined && scrolledPages !== 0) {
      this.updateItemsTypeCountForGroupListScrolling(itemsAll, scrolledPages);
    } else {
      this.updateListItemsTypeCountForGroupListFull(itemsAll);
    }
  }

  private updateItemsTypeCountForGroupListScrolling(
    itemsAll: TreeItem[],
    scrolledPages?: number
  ): void {
    // this method optimizes the update of the type counters in regards of performance in case of scrolling
    // the method considers the difference of the pageBase for the calculation of the counters.

    scrolledPages = scrolledPages ?? 0;

    const oldBaseIndex: number = (this.pageBase - scrolledPages) * this.pageSize;
    const newBaseIndex: number = this.pageBase * this.pageSize;
    this.groupItemsCountAfter = this.groupItemsCountAfter + this.groupItemsCountVirtualized;
    this.listItemsCountAfter = this.listItemsCountAfter + this.listItemsCountVirtualized;
    this.groupItemsCountVirtualized = 0;
    this.listItemsCountVirtualized = 0;
    if (scrolledPages > 0) {
      for (let idx: number = oldBaseIndex; idx < newBaseIndex; idx++) {
        if (this.isGroupItem(itemsAll[idx])) {
          this.groupItemsCountBefore++;
          this.groupItemsCountAfter--;
        } else {
          this.listItemsCountBefore++;
          this.listItemsCountAfter--;
        }
      }
    } else {
      for (let idx: number = newBaseIndex; idx < oldBaseIndex; idx++) {
        if (this.isGroupItem(itemsAll[idx])) {
          this.groupItemsCountBefore--;
          this.groupItemsCountAfter++;
        } else {
          this.listItemsCountBefore--;
          this.listItemsCountAfter++;
        }
      }
    }
    const upper: number = newBaseIndex + this.itemsVirtualizedCount;
    for (let vi: number = newBaseIndex; vi < upper; vi++) {
      if (this.isGroupItem(itemsAll[vi])) {
        this.groupItemsCountVirtualized++;
      } else {
        this.listItemsCountVirtualized++;
      }
    }
    this.groupItemsCountAfter = this.groupItemsCountAfter - this.groupItemsCountVirtualized;
    this.listItemsCountAfter = this.listItemsCountAfter - this.listItemsCountVirtualized;
  }

  private updateListItemsTypeCountForGroupListFull(itemsAll: TreeItem[]): void {
    // does fully update the counters for the whole list.

    this.groupItemsCountBefore = 0;
    this.groupItemsCountVirtualized = 0;
    this.groupItemsCountAfter = 0;
    const virtTop: number = this.itemBaseIdx + this.itemsVirtualizedCount;
    for (let i = 0; i < itemsAll.length; i++) {
      if (this.isGroupItem(itemsAll[i])) {
        if (i < this.itemBaseIdx) {
          this.groupItemsCountBefore++;
        } else if (i < virtTop) {
          this.groupItemsCountVirtualized++;
        } else {
          this.groupItemsCountAfter++;
        }
      }
    }
    this.listItemsCountBefore = this.itemBaseIdx - this.groupItemsCountBefore;
    this.listItemsCountVirtualized = this.itemsVirtualizedCount - this.groupItemsCountVirtualized;
    this.listItemsCountAfter =
      itemsAll.length -
      this.listItemsCountBefore -
      this.listItemsCountVirtualized -
      this.groupItemsCountBefore -
      this.groupItemsCountVirtualized -
      this.groupItemsCountAfter;
  }

  private isGroupItem(item: TreeItem): boolean {
    return !item.parent && this.siTreeViewService.groupedList;
  }

  private handleScrollSimple(scrollTop: number, itemsAll: TreeItem[]): void {
    // Notes:
    // This method is used in case all tree list items are of the same height.
    // This allows for an optimized and proper calculation of the pageBase.
    // pageBase stores the index of the first page which is virtualized.

    // totalDeltaScrollVirt corresponds to the total virtualized items height above the visible area
    const totalDeltaScrollVirt: number = scrollTop - this.heightBefore;
    let updateVirtList = false;
    const pageHeight: number = this.pageSize * (this.siTreeViewItemHeightService.itemHeight ?? 0);
    const pageBaseOld: number = this.pageBase;

    const pageChangeDownTrigger = 3;
    if (this.scrollTopPrev < scrollTop) {
      // Scroll down:
      // We do keep always between two and three pages virtualized above the view, when scrolling down.
      // => We remove pages from the top only when more than three pages are 'above' the visible view
      // => It is mandatory, that the trigger points are calculated exactly in order to get a nice scrolling behavior for all situations
      if (totalDeltaScrollVirt > pageChangeDownTrigger * pageHeight) {
        const pagesOutsideView: number = totalDeltaScrollVirt / pageHeight;
        // Two pages shall remain 'above' the view;
        // It is important that this number is higher than the trigger when scrolling up (which is one page, see the next else statement)
        // Thus we have a hysteresis of one page in order to avoid scrollbar jitters!!
        this._pageBase = this.pageBase + Math.floor(pagesOutsideView) - (pageChangeDownTrigger - 1);
        updateVirtList = true;
      }
    } else if (this.scrollTopPrev > scrollTop) {
      // scroll up
      if (totalDeltaScrollVirt < pageHeight) {
        // we add pages to the top as soon as only one page (or smaller) is 'above' the visible view
        const pagesOutsideView: number = totalDeltaScrollVirt / pageHeight;
        this._pageBase = this.pageBase + Math.floor(pagesOutsideView) - (pageChangeDownTrigger - 2);
        if (this.pageBase < 0) {
          this._pageBase = 0; // pageBase cannot be lower than 0; if pageBase=0 then we have no pages above the visible view.
        }
        if (this._pageBase !== pageBaseOld) {
          updateVirtList = true;
        }
      }
    }

    this.scrollTopPrev = scrollTop;
    if (updateVirtList) {
      this.updateVirtualizedItemListIntern(itemsAll, this.pageBase - pageBaseOld);
    }
  }

  private handleScrollGrouped(scrollTop: number, itemsAll: TreeItem[]): void {
    // Notes:
    // This method is used in case the tree list is grouped => the group items have a different height than the other items.
    // This allows for an optimized and averaged calculation of the new pageBase.
    // pageBase stores the index of the first page which is virtualized.

    // totalDeltaScrollVirt corresponds to the total virtualized items height above the visible area
    const totalDeltaScrollVirt: number = scrollTop - this.heightBefore;
    const pageHeightFirst3: number =
      this.calculateVirtPageHeight(0) +
      this.calculateVirtPageHeight(1) +
      this.calculateVirtPageHeight(2);

    let updateVirtList = false;
    const pageHeightFirst1: number = this.calculateVirtPageHeight(0);
    const pageHeightAvg: number = pageHeightFirst3 / 3;
    const pageBaseOld: number = this.pageBase;

    if (this.scrollTopPrev < scrollTop) {
      // Scroll down:
      // We do keep always between two and three pages virtualized above the view, when scrolling down.
      // => We remove pages from the top only when more than three pages are 'above' the visible view.
      // => It is mandatory, that the trigger points are calculated exactly in order to get a nice scrolling behavior for all situations.
      if (totalDeltaScrollVirt > pageHeightFirst3) {
        // Next calculation is averaged. It seems not needed to properly calculate it based on the all the real items.
        const pagesOutsideView: number = totalDeltaScrollVirt / pageHeightAvg;
        // Two pages shall remain 'above' the view;
        // It is important that this number is higher than the trigger when scrolling up (which is one page, see next else).
        // Thus we have a hysteresis of one page in order to avoid scrollbar jitters!!
        this._pageBase = this.pageBase + Math.floor(pagesOutsideView) - 2;
        updateVirtList = true;
      }
    } else if (this.scrollTopPrev > scrollTop) {
      // scroll up
      if (totalDeltaScrollVirt < pageHeightFirst1) {
        // we add pages to the top as soon as only one page (or smaller) is 'above' the visible view
        const pagesOutsideView: number = totalDeltaScrollVirt / pageHeightAvg;
        this._pageBase = this.pageBase + Math.floor(pagesOutsideView) - 1;
        if (this.pageBase < 0) {
          this._pageBase = 0; // pageBase cannot be lower than 0; if pageBase=0 then we have no pages above the visible view.
        }
        if (this._pageBase !== pageBaseOld) {
          updateVirtList = true;
        }
      }
    }

    this.scrollTopPrev = scrollTop;
    if (updateVirtList) {
      this.updateVirtualizedItemListIntern(itemsAll, this.pageBase - pageBaseOld);
    }
  }
}
