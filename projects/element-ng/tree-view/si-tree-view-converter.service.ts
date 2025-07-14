/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';

import { TreeItem } from './si-tree-view.model';
import { SiTreeViewService } from './si-tree-view.service';

/**
 * Provides the functionality to flatten the hierarchical tree structure into a flat one dimensional array; called flattenedTrees.
 * The TreeViewComponent uses this flattened trees (the array) to bind the contained tree/list items to the GUI into a list.
 * In addition the service provides the number of 'normal' list items and the number of group items.
 * Important:
 * The coupling to the TreeViewComponent is high, thus the service is provided only by the TreeViewComponent.
 */
@Injectable()
export class SiTreeViewConverterService {
  /**
   * The flattened tree array; filled upon calling the method 'fillFlattenedTree'
   *
   * @defaultValue []
   */
  flattenedTrees: TreeItem[] = [];

  /**
   * The number of group items of the flattened tree.
   *
   * @defaultValue 0
   */
  groupItemsCount = 0;

  /**
   * The total items count of the flattened tree.
   *
   * @defaultValue 0
   */
  itemsTotal = 0;

  private siTreeViewService = inject(SiTreeViewService);

  /**
   * Flattens the tree handed over as parameter.
   * Takes the mode of the tree into consideration:
   * In case of a flat tree: only the first level of the items parameter is copied into the flattenedTrees array.
   * In case of a grouped tree: only the first two levels are copied into the flattenedTrees array
   * In the other cases all tree nodes are copied into the flattenedTrees array.
   */
  fillFlattenedTree(items: TreeItem[], isFlatTree: boolean): void {
    if (isFlatTree === false) {
      this.flattenedTrees = [];
      if (this.siTreeViewService.groupedList) {
        this.fillFlattenedTreeRecursive(items, 2, 0);
      } else {
        this.fillFlattenedTreeRecursive(items);
      }
    } else {
      this.flattenedTrees = items;
      this.groupItemsCount = 0;
    }
    this.itemsTotal = items.length;
  }

  private fillFlattenedTreeRecursive(
    items: TreeItem[],
    noOfLevels?: number,
    stackLevel?: number
  ): void {
    if (noOfLevels !== undefined && stackLevel !== undefined && noOfLevels <= stackLevel) {
      return;
    }

    stackLevel = stackLevel ?? 0;

    for (const current of items) {
      this.flattenedTrees.push(current);
      if (this.siTreeViewService.isGroupedItem(current)) {
        this.groupItemsCount++;
      }
      if (current.state === 'expanded') {
        this.fillFlattenedTreeRecursive(current.children ?? [], noOfLevels, stackLevel + 1);
      }
    }
  }
}
