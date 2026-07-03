/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { TreeItem } from '@siemens/element-ng/tree-view';

/** Recursively sets the `checked` state on every node. */
const applyCheckedState = (nodes: TreeItem[], selected: string[]): void => {
  for (const node of nodes) {
    if (node.children?.length) {
      applyCheckedState(node.children, selected);
      const allChecked = node.children.every(c => c.checked === 'checked');
      const someChecked = node.children.some(
        c => c.checked === 'checked' || c.checked === 'indeterminate'
      );
      node.checked = allChecked ? 'checked' : someChecked ? 'indeterminate' : 'unchecked';
    } else {
      node.checked = selected.includes(node.label as string) ? 'checked' : 'unchecked';
    }
  }
};

/**
 * Deep-clones tree items via JSON serialization and sets the `checked` state
 * based on the provided selected labels. The deep clone is required because
 * the tree view mutates the model (checked / state / etc.).
 */
export const cloneTreeWithCheckedState = (items: TreeItem[], selected: string[]): TreeItem[] => {
  const clone = JSON.parse(JSON.stringify(items)) as TreeItem[];
  applyCheckedState(clone, selected);
  return clone;
};

/**
 * Collects all checked leaf labels from a tree.
 */
export const collectCheckedLeaves = (items: TreeItem[]): string[] => {
  const result: string[] = [];
  for (const item of items) {
    if (item.children?.length) {
      result.push(...collectCheckedLeaves(item.children));
    } else if (item.checked === 'checked' && item.label) {
      result.push(item.label as string);
    }
  }
  return result;
};

/** Collects all leaf labels beneath every node in `nodes`. */
const collectAllLeafLabels = (nodes: TreeItem[]): string[] => {
  const result: string[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      result.push(...collectAllLeafLabels(node.children));
    } else if (node.label) {
      result.push(node.label as string);
    }
  }
  return result;
};

const compactNode = (nodes: TreeItem[], selectedSet: Set<string>, result: TreeItem[]): void => {
  for (const node of nodes) {
    if (node.children?.length) {
      const allLeafLabels = collectAllLeafLabels(node.children);
      const allSelected = allLeafLabels.every(label => selectedSet.has(label));

      if (allSelected && allLeafLabels.length > 0) {
        result.push(node);
      } else {
        compactNode(node.children, selectedSet, result);
      }
    } else if (node.label && selectedSet.has(node.label as string)) {
      result.push(node);
    }
  }
};

/**
 * Given a flat list of checked leaf labels and the full tree, returns a
 * compacted list of {@link TreeItem} references where fully-selected subtrees
 * are replaced by their parent node.
 */
export const compactSelected = (items: TreeItem[], selected: string[]): TreeItem[] => {
  const selectedSet = new Set(selected);
  const result: TreeItem[] = [];
  compactNode(items, selectedSet, result);
  return result;
};

/**
 * Expands a list of compacted {@link TreeItem} references back to the
 * leaf labels they represent, so the tree can restore checkbox state.
 */
export const expandCompactItems = (items: TreeItem[]): string[] => {
  const result: string[] = [];
  for (const item of items) {
    if (item.children?.length) {
      result.push(...collectAllLeafLabels(item.children));
    } else if (item.label) {
      result.push(item.label as string);
    }
  }
  return result;
};
