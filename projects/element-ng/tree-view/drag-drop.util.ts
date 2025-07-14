/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { CdkDragDrop } from '@angular/cdk/drag-drop';

import type { TreeItem } from './si-tree-view.model';

/**
 *
 * @param treeItems - TreeItem array which is used with the si-tree-view.
 * @param event - event object which is emitted by cdkDropListDropped.
 * @returns reordered TreeItems list.
 */
export const reorderTreeItem = (treeItems: TreeItem[], event: CdkDragDrop<any>): TreeItem[] => {
  if (event.currentIndex === event.previousIndex) {
    return treeItems;
  }
  const targetIndex =
    event.currentIndex < event.previousIndex ? event.currentIndex - 1 : event.currentIndex;
  modifyTreeStructure(treeItems, event, treeItems, targetIndex);
  return treeItems;
};

/**
 *
 * @param sourceTreeItems - TreeItem array of the source tree from where item is being dragged.
 * @param targetTreeItems - TreeItem array of the target tree where item is being dropped.
 * @param event - event object which is emitted by cdkDropListDropped.
 * @param removeFromSource - whether to remove item from its source tree after moving to target.
 * @returns modified TreeItems list of source and target trees.
 */
export const transferTreeItem = (
  sourceTreeItems: TreeItem[],
  targetTreeItems: TreeItem[],
  event: CdkDragDrop<TreeItem[]>,
  removeFromSource: boolean = false
): {
  sourceTree: TreeItem[];
  targetTree: TreeItem[];
} => {
  modifyTreeStructure(
    sourceTreeItems,
    event,
    targetTreeItems,
    event.currentIndex - 1,
    removeFromSource
  );
  return {
    sourceTree: sourceTreeItems,
    targetTree: targetTreeItems
  };
};

/**
 *
 * @param sourceTree - TreeItems array from where item needs to be removed.
 * @param itemToRemove - TreeItem which needs to be removed.
 * @returns Updated TreeItems array.
 */
export const removeItemFromTree = (sourceTree: TreeItem[], itemToRemove: TreeItem): TreeItem[] => {
  const sourceItem = findTreeItem(sourceTree, itemToRemove);
  const itemParent = sourceItem?.parent;
  if (!itemParent) {
    console.error('Item parent not found.');
    return sourceTree;
  }
  if (itemParent.children) {
    const itemIndex = itemParent.children.indexOf(itemToRemove);
    itemParent.children?.splice(itemIndex, 1);
  }
  return sourceTree;
};

const findTreeItem = <T extends TreeItem>(array: T[], targetItem: T): T | null => {
  for (const obj of array) {
    // Check if the current item reference is the same as the target object reference
    if (obj === targetItem) {
      return obj; // Found the item, return it
    }
    // If the current item has nested children, recursively search within them
    const key = 'children';
    if (Array.isArray(obj[key])) {
      const found = findTreeItem(obj[key] as T[], targetItem);
      if (found) return found; // If found in nested array, return it
    }
  }
  return null; // Object not found
};

const modifyTreeStructure = (
  sourceItems: TreeItem[],
  event: CdkDragDrop<TreeItem[]>,
  targetItems: TreeItem[],
  targetIndex: number,
  removeFromSource = true
): void => {
  const sourceTreeItem = findTreeItem(
    sourceItems,
    event.previousContainer.data[event.previousIndex]
  );

  if (!sourceTreeItem) {
    console.error('Source tree item not found');
    return;
  }

  const sourceTreeItemCopy = structuredClone(sourceTreeItem);

  const targetTreeItem = findTreeItem<TreeItem>(
    targetItems,
    event.container.data[targetIndex < 0 ? 0 : targetIndex]
  );

  if (!targetTreeItem) {
    console.error('Target tree item not found');
    return;
  }

  if (findTreeItem(sourceTreeItem.children!, targetTreeItem)) {
    console.error('Cannot move parent into its own child');
    return;
  }

  const targetItemParent = targetTreeItem?.parent;
  if (targetIndex < 0) {
    sourceTreeItemCopy.parent = targetItemParent;
    sourceTreeItemCopy.level = targetItemParent?.level ? targetItemParent.level + 1 : 0;
    targetItemParent?.children?.splice(0, 0, sourceTreeItemCopy);
  } else if (targetTreeItem?.state === 'expanded') {
    sourceTreeItemCopy.parent = targetTreeItem;
    sourceTreeItemCopy.level = targetTreeItem.level ? targetTreeItem.level + 1 : 0;
    if (targetTreeItem.children?.length) {
      targetTreeItem.children = [sourceTreeItemCopy, ...targetTreeItem.children];
    } else {
      targetTreeItem.children = [sourceTreeItemCopy];
    }
  } else {
    if (targetItemParent) {
      const targetItemIndex = targetItemParent.children?.indexOf(targetTreeItem) ?? -1;
      sourceTreeItemCopy.parent = targetItemParent;
      sourceTreeItemCopy.level = targetItemParent.level ? targetItemParent.level + 1 : 0;
      targetItemParent?.children?.splice(targetItemIndex + 1, 0, sourceTreeItemCopy);
    }
  }
  const sourceTreeItemParent = sourceTreeItem.parent;
  if (removeFromSource && sourceTreeItemParent) {
    const sourceItemIndex = sourceTreeItemParent.children?.indexOf(sourceTreeItem) ?? -1;
    sourceTreeItemParent?.children?.splice(sourceItemIndex, 1);
  }
};
