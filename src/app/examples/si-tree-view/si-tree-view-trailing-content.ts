/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import {
  reorderTreeItem,
  SiTreeViewComponent,
  SiTreeViewItemComponent,
  SiTreeViewItemDirective,
  TreeItem
} from '@siemens/element-ng/tree-view';

@Component({
  selector: 'app-sample',
  imports: [
    SiTreeViewComponent,
    SiTreeViewItemComponent,
    SiTreeViewItemDirective,
    DragDropModule,
    SiNumberInputComponent
  ],
  templateUrl: './si-tree-view-trailing-content.html',
  host: { class: 'p-5' }
})
// NOTE: This example demonstrates CDK drag drop with custom trailing content and is not yet production ready.
export class SampleComponent {
  protected templates: TreeItem[] = [
    {
      label: 'Temperature sensor',
      icon: 'element-temperature',
      state: 'leaf',
      customData: { control: 'count', count: 1 }
    },
    {
      label: 'HVAC unit',
      icon: 'element-vrf',
      state: 'leaf',
      customData: { control: 'ack', acknowledged: false }
    },
    {
      label: 'Air quality sensor',
      icon: 'element-indoor-air-quality',
      state: 'leaf',
      customData: { control: 'status' }
    },
    { label: 'LED panel', icon: 'element-light', state: 'leaf', customData: { control: 'menu' } }
  ];

  protected selection: TreeItem[] = [];

  protected reorderTemplates(event: CdkDragDrop<TreeItem[]>): void {
    if (event.previousContainer === event.container) {
      this.templates = [...reorderTreeItem(this.templates, event)];
    }
  }

  protected dropInSelection(event: CdkDragDrop<TreeItem[]>): void {
    if (event.previousContainer === event.container) {
      this.selection = [...reorderTreeItem(this.selection, event)];
      return;
    }
    // Copy the dragged template in; templates stay in the source tree.
    const template = event.previousContainer.data[event.previousIndex];
    const copy: TreeItem = {
      label: template.label,
      icon: template.icon,
      state: 'leaf',
      customData: { ...template.customData }
    };
    this.selection = [
      ...this.selection.slice(0, event.currentIndex),
      copy,
      ...this.selection.slice(event.currentIndex)
    ];
  }

  protected toggleAcknowledged(item: TreeItem): void {
    item.customData.acknowledged = !item.customData.acknowledged;
  }
}
