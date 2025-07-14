/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  reorderTreeItem,
  SiTreeViewComponent,
  SiTreeViewItemComponent,
  SiTreeViewItemDirective,
  transferTreeItem,
  TreeItem
} from '@siemens/element-ng/tree-view';

import { treeItemsUnderMaintenance, treeItemsWithCompletedMaintenance } from './tree-items';

@Component({
  selector: 'app-sample',
  imports: [SiTreeViewComponent, SiTreeViewItemComponent, SiTreeViewItemDirective, DragDropModule],
  templateUrl: './si-tree-view-drag-drop-move.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
// NOTE: This example is to demonstrate CDK drag drop API capabilities with SiTreeViewItemNextComponent
// and it is not yet production ready.
export class SampleComponent {
  protected moveTreeOneList = treeItemsUnderMaintenance;
  protected moveTreeTwoList = treeItemsWithCompletedMaintenance;

  protected itemDroppedTreeOne(event: CdkDragDrop<TreeItem[]>): void {
    const targetIndex =
      event.currentIndex < event.previousIndex ? event.currentIndex - 1 : event.currentIndex;

    const dragItem = event.container.data[event.previousIndex];
    const targetItem = event.container.data[targetIndex];

    if (!this.isValidMove(dragItem, targetItem)) {
      return;
    }
    const updatedTree = [...reorderTreeItem(this.moveTreeOneList, event)];
    this.moveTreeOneList = updatedTree;
  }

  protected itemDroppedTreeTwo(event: CdkDragDrop<any>): void {
    let targetIndex = event.currentIndex - 1;
    if (event.container === event.previousContainer) {
      targetIndex =
        event.currentIndex < event.previousIndex ? event.currentIndex - 1 : event.currentIndex;
    }

    const dragItem = event.previousContainer.data[event.previousIndex];
    const targetItem = event.container.data[targetIndex];

    if (!this.isValidMove(dragItem, targetItem)) {
      return;
    }
    if (event.container === event.previousContainer) {
      const updatedTree = [...reorderTreeItem(this.moveTreeTwoList, event)];
      this.moveTreeTwoList = updatedTree;
    } else {
      const updatedTrees = transferTreeItem(
        this.moveTreeOneList,
        this.moveTreeTwoList,
        event,
        true
      );
      this.moveTreeOneList = [...updatedTrees.sourceTree];
      this.moveTreeTwoList = [...updatedTrees.targetTree];
    }
  }

  private isValidMove(source: TreeItem, target: TreeItem): boolean {
    if (source.level === 0 && (!target || (target.level === 0 && !(target.state === 'expanded')))) {
      return true;
    } else {
      if (target && source.state === 'leaf') {
        // if target is leaf then item will be dropped as sibling to that target
        if (target.state === 'leaf') {
          return source.parent?.customData.locatorId === target.parent?.customData.locatorId;
        }
        // item will be dropped as a children to the target item
        // in case of expanded target
        else if (target.state === 'expanded') {
          return source.parent?.customData.locatorId === target.customData.locatorId;
        }
      } else {
        if (target?.customData) {
          return source.customData.locatorId === target.customData.locatorId;
        }
      }
      return false;
    }
  }

  protected allowDrop(dragItem: CdkDrag<TreeItem>, dropList: CdkDropList): boolean {
    return dragItem.data.level === 2;
  }
}
