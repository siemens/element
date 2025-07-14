/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { EventEmitter, inject, Injectable } from '@angular/core';

import { TreeItem } from './si-tree-view.model';
import { SiTreeViewService } from './si-tree-view.service';

/**
 * This service provides helper functionality for the tree view to read the height of the tree/list items and
 * the group list items out of the DOM.
 *
 * Important: The coupling to the TreeViewComponent is very high as the service contains knowledge on the HTML structure!!!
 * Thus the service is provided only by the TreeViewComponent.
 *
 * Constraint: The height of the items (DOM elements) must be all the same; The height of the grouped items (DOM elements)
 * must be all the same;
 */
@Injectable()
export class SiTreeViewItemHeightService {
  /**
   * The height of a tree list item.
   * Can be undefined if the tree list has not been layout rendered yet.
   */
  itemHeight?: number;

  /**
   * The height of a grouped list item.
   * Can be undefined if the tree list has not been layout rendered yet or if it does not contain group items.
   */
  groupItemHeight?: number;

  /**
   * Emitter for itemHeight changes.
   */
  readonly itemHeightChange = new EventEmitter<number>();

  private siTreeViewService = inject(SiTreeViewService);

  /**
   * Updates the height of a list item, if an appropriate item is in the DOM.
   *
   * @returns The new height of the list item; or undefined if no list item is in the DOM yet.
   */
  updateItemHeight(
    elementList: Element,
    flattenedTrees: TreeItem[],
    itemsBase: number,
    virtualizedItems: number
  ): number | undefined {
    let newHeight: number | undefined;
    let itemsTop: number = itemsBase + virtualizedItems;
    if (itemsTop > flattenedTrees.length) {
      itemsTop = flattenedTrees.length;
    }
    for (let i: number = itemsBase; i < itemsTop; i++) {
      if (this.siTreeViewService.isGroupedItem(flattenedTrees[i]) === false) {
        newHeight = this.getItemHeightOfListElement(elementList, i - itemsBase);
        break;
      }
    }
    if (newHeight !== undefined && this.itemHeight !== newHeight) {
      this.itemHeight = newHeight;
      this.itemHeightChange.emit(newHeight);
    }

    return newHeight;
  }

  /**
   * Updates the height of a group item, if an appropriate item is in the DOM.
   *
   * @returns The new height of the group item; or undefined if no group item is in the DOM yet.
   */
  updateGroupedItemHeight(
    elementList: Element,
    flattenedTrees: TreeItem[],
    itemsBase: number,
    virtualizedItems: number
  ): number | undefined {
    let newHeight: number | undefined;
    let itemsTop: number = itemsBase + virtualizedItems;
    if (itemsTop > flattenedTrees.length) {
      itemsTop = flattenedTrees.length;
    }
    for (let i: number = itemsBase; i < itemsTop; i++) {
      if (this.siTreeViewService.isGroupedItem(flattenedTrees[i])) {
        newHeight = this.getItemHeightOfListElement(elementList, i - itemsBase);
        break;
      }
    }
    if (newHeight !== undefined) {
      this.groupItemHeight = newHeight;
    }

    return newHeight;
  }

  private getItemHeightOfListElement(elementList: Element, index: number): number | undefined {
    const items = elementList.querySelectorAll('si-tree-view-item');
    if (index < items.length) {
      return items.item(index).getBoundingClientRect().height;
    }
    return undefined;
  }
}
