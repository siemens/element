/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { CheckboxState, TreeItem, TreeItemFolderState } from './si-tree-view.model';

interface InBetweenState {
  startIsFirst: boolean;
  inBetween: boolean;
  done: boolean;
}

export const ROOT_LEVEL = -1;

export const childrenLoaded = (item: TreeItem): boolean => (item.children?.length ?? 0) > 0;

export const hasChildren = (item: TreeItem): boolean => item.state !== 'leaf';

export const removeUndefinedState = (state?: TreeItemFolderState): TreeItemFolderState =>
  state ?? 'collapsed';

/**
 * Collapses the tree item except for leaf items.
 */
export const collapse = (item: TreeItem): void => {
  if (item?.state !== 'leaf') {
    item.state = 'collapsed';
  }
};

/**
 * Expands the tree item except for leaf items.
 */
export const expand = (item: TreeItem): void => {
  if (item?.state !== 'leaf') {
    item.state = 'expanded';
  }
};

export const expandRecursive = (item: TreeItem): void => {
  if (item.parent) {
    expand(item.parent);
    expandRecursive(item.parent);
  }
};

export const boxClicked = (treeItem: TreeItem, inheritChecked: boolean): void => {
  if (treeItem.showCheckbox) {
    treeItem.checked = treeItem.checked === 'checked' ? 'unchecked' : 'checked';
    if (inheritChecked) {
      checkAllChildren(treeItem, treeItem.checked);
      updateCheckStateOfParents(treeItem);
    }
  }
  if (treeItem.showOptionbox && treeItem.checked === 'unchecked') {
    treeItem.parent?.children?.forEach(item => (item.checked = 'unchecked'));
    treeItem.checked = 'checked';
  }
};

/**
 * Changes the folder state to a new state based on the old state.
 * If a client calls this method, the same is responsible to load the children in case the new state is 'expanding'!!!
 *
 * @param deleteChildrenOnCollapse - If set to true, the children are deleted upon collapsing the item.
 */
export const doFolderStateChange = (
  item: TreeItem,
  deleteChildrenOnCollapse: boolean,
  newState?: string
): void => {
  if (item?.state === 'collapsed' && (!newState || newState === 'expanded')) {
    item.state = childrenLoaded(item) ? 'expanded' : 'expanding';
  } else if (item?.state === 'expanding' && (!newState || newState === 'collapsed')) {
    item.state = 'collapsed';
  } else if (item?.state === 'expanded' && (!newState || newState === 'collapsed')) {
    if (deleteChildrenOnCollapse) {
      item.children = [];
    }
    item.state = 'collapsed';
  }
};

export const enableCheckboxRecursive = (item: TreeItem, enable: boolean): void => {
  item.showCheckbox = enable;
  if (childrenLoaded(item)) {
    item.children?.forEach(child => enableCheckboxRecursive(child, enable));
  }
};

export const enableOptionboxRecursive = (item: TreeItem, enable: boolean): void => {
  item.showOptionbox = enable;
  if (childrenLoaded(item)) {
    item.children?.forEach(child => enableOptionboxRecursive(child, enable));
  }
};

export const parentCountRecursive = (item: TreeItem, stackLevel: number): number => {
  if (item?.parent && item.parent.level !== ROOT_LEVEL) {
    return parentCountRecursive(item.parent, stackLevel + 1);
  }
  return stackLevel;
};

export const selectItemsBetween = <T = any>(
  roots: TreeItem<T>[],
  start: TreeItem<T>,
  end: TreeItem<T>
): TreeItem<T>[] | undefined => {
  if (start === end) {
    return;
  }
  const foundItems: TreeItem<T>[] = [];
  const inBetweenState: InBetweenState = { startIsFirst: false, inBetween: false, done: false };
  for (const root of roots) {
    getItemsBetweenRecursive(foundItems, root, start, end, inBetweenState);
    if (inBetweenState.done) {
      break;
    }
  }
  foundItems.forEach(item => {
    if (item.selectable) {
      item.selected = true;
    }
  });
  return foundItems;
};

export const selectRecursive = (item: TreeItem, select: boolean): void => {
  if (item.selectable) {
    item.selected = select;
  }
  if (childrenLoaded(item)) {
    item.children?.forEach(child => selectRecursive(child, select));
  }
};

export const setBoxStateRecursive = (item: TreeItem, state: CheckboxState): void => {
  item.checked = state;
  if (childrenLoaded(item)) {
    item.children?.forEach(child => setBoxStateRecursive(child, state));
  }
};

/**
 * Sets the item to be active or not; all other items of the tree are reset.
 */
export const setActive = (item: TreeItem, active: boolean): void => {
  const getRoot = (treeItem: TreeItem): TreeItem =>
    treeItem.parent ? getRoot(treeItem.parent) : treeItem;
  resetActive(getRoot(item));
  item.active = active;
};

export const resetActive = (item: TreeItem): void => {
  item.active = false;
  if (childrenLoaded(item)) {
    item.children?.forEach(childItem => resetActive(childItem));
  }
};

/**
 * Sets the treeItem as selectable or not
 */
export const setSelectable = (item: TreeItem, selectable: boolean): void => {
  item.selectable = selectable;
  if (item.selected && !item.selectable) {
    item.selected = selectable;
  }
};

export const deleteItem = (item: TreeItem): void => {
  if (item.parent) {
    const idx = item.parent.children?.indexOf(item) ?? -1;
    if (idx < 0) {
      return;
    }
    item.parent.children?.splice(idx, 1);
  }
};

export const addChildItem = (
  parent: TreeItem,
  child: TreeItem,
  position?: number,
  callback?: (item: TreeItem) => void
): void => {
  addChildItems(parent, [child], position, callback);
};

export const addChildItems = (
  parent: TreeItem,
  children: TreeItem[],
  position?: number,
  callback?: (item: TreeItem) => void
): void => {
  const itemCount = parent.children?.length ?? 0;
  position ??= itemCount;
  // Negative position insert items counting from the last item
  if (position < 0) {
    position = itemCount + (position % itemCount);
  }
  initializeTreeItemsRecursive(children, parent, callback);
  if (!parent.children) {
    parent.children = [];
    parent.children.push(...children);
    return;
  }
  if (position >= parent.children.length) {
    parent.children.push(...children);
    return;
  }
  parent.children.splice(position, 0, ...children);
};

export const initializeTreeItemsRecursive = (
  items: TreeItem[],
  parent: TreeItem,
  callback?: (item: TreeItem) => void
): void => {
  const level = (parent.level ?? -1) + 1;
  for (const item of items) {
    item.parent = parent;
    item.level = level;
    setTreeItemDefaults(item, callback);
    if (item.children?.length) {
      initializeTreeItemsRecursive(item.children, item, callback);
    }
  }
};

export const setTreeItemDefaults = (item: TreeItem, callback?: (item: TreeItem) => void): void => {
  item.children ??= [];
  item.state ??= 'collapsed';
  item.active ??= false;
  item.checked ??= 'unchecked';
  item.selected ??= false;
  item.selectable ??= true;
  if (callback) {
    callback(item);
  }
};

const checkAllChildren = (treeItem: TreeItem, check: CheckboxState): void => {
  if (childrenLoaded(treeItem)) {
    treeItem.children?.forEach(item => {
      item.checked = check;
      checkAllChildren(item, check);
    });
  }
};

const getItemsBetweenRecursive = (
  found: TreeItem[],
  current: TreeItem,
  start: TreeItem,
  end: TreeItem,
  inBetweenState: InBetweenState
): void => {
  if (inBetweenState.done) {
    return;
  }
  if (current === start && !inBetweenState.inBetween) {
    // This is the first found tree item within the selection, the start tree item (the item which is clicked first) is ordered
    // before the end tree item (the item which is clicked second).
    // The recursive function is from now on handling tree node which are in between the two selections.
    // Note, we don't need to select it, as it is already selected with previous click
    inBetweenState.startIsFirst = true;
    inBetweenState.inBetween = true;
  } else if (current === end && !inBetweenState.inBetween) {
    // This is the first found tree item within the selection, the end tree item (the item which is clicked second) is ordered
    // before the start tree item (the item which is clicked first).
    // The recursive function is from now on handling tree node which are in between the two selections.
    inBetweenState.startIsFirst = false;
    inBetweenState.inBetween = true;
    found.push(current);
  } else if (current === end && inBetweenState.inBetween) {
    found.push(current);
    inBetweenState.inBetween = false;
    inBetweenState.done = true;
    return; // the end of the search
  } else if (current === start && inBetweenState.inBetween) {
    inBetweenState.inBetween = false;
    inBetweenState.done = true;
    return; // the end of the search
  } else if (inBetweenState.inBetween) {
    found.push(current);
  }

  if (current.state === 'expanded') {
    current.children?.forEach(item =>
      getItemsBetweenRecursive(found, item, start, end, inBetweenState)
    );
  }
};

const updateCheckStateOfParents = (treeItem: TreeItem): void => {
  if (treeItem.parent) {
    let allChecked = true;
    let allUnchecked = true;

    for (const item of treeItem.parent?.children ?? []) {
      if (item.checked === 'indeterminate') {
        treeItem.parent.checked = 'indeterminate';
        updateCheckStateOfParents(treeItem.parent);
        return;
      }
      if (item.checked === 'checked') {
        allUnchecked = false;
      }
      if (item.checked === 'unchecked') {
        allChecked = false;
      }
      if (!allChecked && !allUnchecked) {
        treeItem.parent.checked = 'indeterminate';
        updateCheckStateOfParents(treeItem.parent);
        return;
      }
    }

    if (allChecked) {
      treeItem.parent.checked = 'checked';
    } else {
      treeItem.parent.checked = 'unchecked';
    }
    updateCheckStateOfParents(treeItem.parent);
  }
};
