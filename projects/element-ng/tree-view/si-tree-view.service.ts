/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
  CheckboxClickEventArgs,
  ClickEventArgs,
  FolderStateEventArgs,
  TreeItem
} from './si-tree-view.model';
import { ROOT_LEVEL } from './si-tree-view.utils';

/**
 * Supports communication between the TreeViewComponent and the TreeViewItemComponent and the services.
 * Stores tree specific settings.
 * One instance per TreeViewComponent exists.
 */
@Injectable()
export class SiTreeViewService {
  /** Emits when a tree item is clicked. */
  clickEvent: Subject<ClickEventArgs> = new Subject<ClickEventArgs>();
  /** Emits when a folder item is clicked. */
  folderClickEvent: Subject<FolderStateEventArgs> = new Subject<FolderStateEventArgs>();
  /** Emits when checkbox is clicked. */
  checkboxClickEvent: Subject<CheckboxClickEventArgs> = new Subject<CheckboxClickEventArgs>();
  /** Emits when on tree item expansion to load child items. */
  loadChildrenEvent: Subject<TreeItem> = new Subject<TreeItem>();
  /** Emits when the consumer want a node to be scrolled into view. */
  scrollIntoViewEvent: Subject<ElementRef> = new Subject<ElementRef>();
  /** Emits when the parent shall become focused. */
  focusParentEvent: Subject<TreeItem> = new Subject<TreeItem>();
  /** Emits when the child shall become focused. */
  focusFirstChildEvent: Subject<TreeItem> = new Subject<TreeItem>();
  /**
   * Shows or hides context menu button.
   *
   * @defaultValue true
   */
  enableContextMenuButton = true;
  /**
   * Child padding in pixel (px).
   *
   * @defaultValue 14
   */
  childrenIndentation = 14;
  /**
   * Visualize tree as grouped list, the child padding will have no effect.
   *
   * @defaultValue false
   */
  groupedList = false;
  /** @internal */
  triggerMarkForCheck: Subject<void> = new Subject<void>();
  /** @internal */
  scroll$!: Observable<Event>;
  /** Indicate whether item is a group item. */
  isGroupedItem(item: TreeItem): boolean {
    return (!item.parent || item.parent.level === ROOT_LEVEL) && this.groupedList;
  }
}
