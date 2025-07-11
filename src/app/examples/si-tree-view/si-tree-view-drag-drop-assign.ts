/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  SiTreeViewComponent,
  SiTreeViewItemComponent,
  SiTreeViewItemDirective,
  TreeItem
} from '@siemens/element-ng/tree-view';
import { LOG_EVENT } from '@siemens/live-preview';

import { treeItems } from './tree-items';

@Component({
  selector: 'app-sample',
  imports: [SiTreeViewComponent, SiTreeViewItemComponent, SiTreeViewItemDirective, DragDropModule],
  templateUrl: './si-tree-view-drag-drop-assign.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
// NOTE: This example is to demonstrate CDK drag drop API capabilities with SiTreeViewItemNextComponent
// and it is not yet production ready.
export class SampleComponent {
  log = inject(LOG_EVENT);

  treeItems: TreeItem[] = treeItems;

  assignTreeOneList = this.createDynamicTree(structuredClone(this.treeItems), 'Assign Tree One');

  assignTreeTwoList = this.createDynamicTree(structuredClone(this.treeItems), 'Assign Tree Two');

  treeItemAssigned(event: CdkDragDrop<any>): void {
    this.log(
      `Assigned '${event.previousContainer.data[event.previousIndex].label}' to the '${
        event.container.data.label
      }'`
    );
  }

  allowDrop(dragItem: CdkDrag, dropList: CdkDropList): boolean {
    if (dropList.data.dataField1 === 'SI' && dragItem.data.dataField1 === 'GG') {
      return false;
    }
    return true;
  }

  createDynamicTree(tree: TreeItem[], label: string): TreeItem[] {
    tree.forEach(item => {
      item.label = `${label} ${item.label}`;
      if (item.children) {
        this.createDynamicTree(item.children, label);
      }
    });
    return tree;
  }
}
