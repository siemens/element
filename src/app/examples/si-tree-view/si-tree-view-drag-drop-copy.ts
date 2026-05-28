/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  reorderTreeItem,
  SiCopyDragDirective,
  SiTreeViewComponent,
  SiTreeViewItemComponent,
  SiTreeViewItemDirective,
  transferTreeItem,
  TreeItem
} from '@siemens/element-ng/tree-view';

@Component({
  selector: 'app-sample',
  imports: [
    DragDropModule,
    SiCopyDragDirective,
    SiTreeViewComponent,
    SiTreeViewItemComponent,
    SiTreeViewItemDirective
  ],
  templateUrl: './si-tree-view-drag-drop-copy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  buildingItems: TreeItem[] = [
    {
      label: 'Building A',
      icon: 'element-project',
      state: 'expanded',
      children: [
        {
          label: 'Floor 1',
          icon: 'element-layer',
          state: 'expanded',
          children: [
            { label: 'Room 101', icon: 'element-room', state: 'leaf' },
            { label: 'Room 102', icon: 'element-room', state: 'leaf' }
          ]
        }
      ]
    }
  ];

  equipmentItems: TreeItem[] = [
    {
      label: 'PXC5.E003',
      icon: 'element-automation-station',
      state: 'leaf',
      dataField1: 'Automation Station'
    },
    {
      label: 'QMX3.P37',
      icon: 'element-room-temperature',
      state: 'leaf',
      dataField1: 'Room Sensor'
    },
    {
      label: 'RDG160KN',
      icon: 'element-room-unit',
      state: 'leaf',
      dataField1: 'Room Thermostat'
    },
    {
      label: 'GDB161.1E',
      icon: 'element-motor',
      state: 'leaf',
      dataField1: 'Damper Actuator'
    }
  ];

  rejectBuildingItems = (drag: CdkDrag<TreeItem>, drop: CdkDropList<TreeItem[]>): boolean => false;

  onBuildingDrop(event: CdkDragDrop<TreeItem[]>): void {
    if (event.container === event.previousContainer) {
      this.buildingItems = [...reorderTreeItem(this.buildingItems, event)];
    } else {
      const result = transferTreeItem(this.equipmentItems, this.buildingItems, event, false);
      this.buildingItems = [...result.targetTree];
    }
  }
}
