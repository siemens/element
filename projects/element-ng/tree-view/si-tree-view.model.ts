/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { MenuItem as MenuItemLegacy } from '@spike-rabbit/element-ng/common';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { Observable } from 'rxjs';

import type { SiTreeViewComponent } from './si-tree-view.component';

/**
 * The folder state of a tree item.
 */
export type TreeItemFolderState = 'collapsed' | 'expanding' | 'expanded' | 'leaf';

/**
 * The check box state of a tree item.
 */
export type CheckboxState = 'unchecked' | 'checked' | 'indeterminate';

export type MenuItemsProvider = (
  item: TreeItem
) => (MenuItemLegacy | MenuItem)[] | Observable<(MenuItemLegacy | MenuItem)[]> | null;

/**
 * Defines the data for a tree item. All properties are optional.
 */
export interface TreeItem<T = any> {
  /**
   * Indicates if the item is active, the last clicked item is active always; only one item can be active.
   */
  active?: boolean;

  /**
   * Defines the content of the optional badge. Should be a number or something like "100+".
   * If undefined or empty string, no badge is displayed.
   */
  badge?: string | number;

  /**
   * Defines the background color of the badge. Use the status color names as
   * inputs.
   * @see https://element.siemens.io/components/status-notifications/badges/
   */
  badgeColor?: string;

  /**
   * The state of the checkbox/optionbox.
   */
  checked?: CheckboxState;

  /**
   * The child tree items.
   */
  children?: TreeItem<T>[];

  /**
   * Any custom data that can be used in custom templates. Not shown by default.
   */
  customData?: T;

  /**
   * The text shown for the tree item data field 1.
   */
  dataField1?: string;

  /**
   * The text shown for the tree item data field 2.
   */
  dataField2?: string;

  /**
   * The hierarchy level of the node. This will be auto-calculated by the tree view control.
   */
  level?: number;

  /**
   * The web font icon class name (e.g. element-building). The icon is shown on the left (in LTR) side of the label.
   */
  icon?: string;

  /**
   * The text shown for the tree item label (header).
   */
  label?: string;

  /**
   * The parent tree item. This will be automatically set by the tree view control.
   */
  parent?: TreeItem<T>;

  /**
   * Indicates if the tree item is selectable or not.
   */
  selectable?: boolean;

  /**
   * If the item is selected (note that the tree view component supports single and multi-selection).
   */
  selected?: boolean;

  /**
   * If the tree item shall show a checkbox.
   */
  showCheckbox?: boolean;

  /**
   * If the tree item shall show an optionbox.
   */
  showOptionbox?: boolean;

  /**
   * The folder state of the tree item.
   */
  state?: TreeItemFolderState;

  /**
   * The color of the state pipe; formatted as CSS value ('red' or '#FF0000' or 'rgb(255, 0, 0)').
   */
  stateIndicatorColor?: string;

  /**
   * The name of the template to apply.
   */
  templateName?: string;
}

export interface TreeViewIconSet {
  headerHome: string;
  headerArrow: string;
  itemMenu: string;
  itemCollapsed: string;
  itemCollapsedFlat: string;
  itemCollapsedLeft: string;
  itemExpanded: string;
  itemExpandedFlat: string;
  itemExpandedLeft: string;
}

export class FolderStateEventArgs {
  constructor(
    public treeItem: TreeItem,
    public oldState: TreeItemFolderState,
    public newState: TreeItemFolderState
  ) {}
}

export class CheckboxClickEventArgs {
  public constructor(
    public target: TreeItem,
    public oldState: CheckboxState,
    public newState: CheckboxState
  ) {}
}

export class ClickEventArgs {
  public constructor(
    public target: TreeItem,
    public mouseEvent: MouseEvent | KeyboardEvent
  ) {}
}

export class LoadChildrenEventArgs {
  public constructor(
    public treeItem: TreeItem,
    public callback: (treeItem: TreeItem, children: TreeItem[]) => void
  ) {}
}

export class ItemsVirtualizedArgs {
  public constructor(
    public treeItems: TreeItem[],
    public virtualized: boolean
  ) {}
}

export const DEFAULT_TREE_ICON_SET: TreeViewIconSet = {
  headerHome: 'element-home',
  headerArrow: 'element-left-2 flip-rtl',
  itemMenu: 'element-options-vertical',
  itemCollapsed: 'element-down-2',
  itemCollapsedFlat: 'element-right-2 flip-rtl',
  itemCollapsedLeft: 'element-right-2 flip-rtl',
  itemExpanded: 'element-up-2',
  itemExpandedFlat: 'element-down-3',
  itemExpandedLeft: 'element-down-2'
};

export const DEFAULT_CHILDREN_INDENTATION = 14;

export type TreeItemContext = {
  treeItem: TreeItem;
  index: number;
  parent: SiTreeViewComponent;
};
