/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import {
  SiTreeViewComponent,
  SiTreeViewItemComponent,
  SiTreeViewItemDirective,
  TreeItem
} from '@siemens/element-ng/tree-view';

const templateCatalog: TreeItem[] = [
  { label: 'Temperature sensor', icon: 'element-temperature', state: 'leaf' },
  { label: 'HVAC unit', icon: 'element-vrf', state: 'leaf' },
  { label: 'Air quality sensor', icon: 'element-indoor-air-quality', state: 'leaf' },
  { label: 'LED panel', icon: 'element-light', state: 'leaf' },
  { label: 'Motion sensor', icon: 'element-occupancy-sensor', state: 'leaf' },
  { label: 'Security camera', icon: 'element-security-cam', state: 'leaf' },
  { label: 'Door sensor', icon: 'element-door', state: 'leaf' }
];

const siteConfiguration: TreeItem[] = [
  {
    label: 'Headquarters Zug',
    icon: 'element-project',
    state: 'expanded',
    customData: { locatorId: 'site-zug' },
    children: [
      {
        label: 'Building A',
        icon: 'element-building',
        state: 'expanded',
        customData: { locatorId: 'site-zug-a' },
        children: [{ label: 'Temperature sensor', icon: 'element-temperature', state: 'leaf' }]
      },
      {
        label: 'Building B',
        icon: 'element-building',
        state: 'expanded',
        customData: { locatorId: 'site-zug-b' },
        children: [{ label: 'LED panel', icon: 'element-light', state: 'leaf' }]
      }
    ]
  },
  {
    label: 'Office Milano',
    icon: 'element-project',
    state: 'expanded',
    customData: { locatorId: 'site-milano' },
    children: [
      {
        label: 'Building 1',
        icon: 'element-building',
        state: 'expanded',
        customData: { locatorId: 'site-milano-1' },
        children: [{ label: 'Security camera', icon: 'element-security-cam', state: 'leaf' }]
      }
    ]
  }
];

@Component({
  selector: 'app-sample',
  imports: [SiTreeViewComponent, SiTreeViewItemComponent, SiTreeViewItemDirective, DragDropModule],
  templateUrl: './si-tree-view-drag-drop-copy-from-list.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected catalogList = templateCatalog;
  protected siteList = siteConfiguration;

  protected itemDroppedOnSite(event: CdkDragDrop<TreeItem[]>): void {
    if (event.container === event.previousContainer) {
      return;
    }

    const dragItem = event.previousContainer.data[event.previousIndex];
    const targetItem = event.container.data[event.currentIndex - 1];

    if (!this.isValidDrop(dragItem, targetItem)) {
      return;
    }

    const parent = targetItem.state === 'expanded' ? targetItem : targetItem.parent;
    if (!parent) {
      return;
    }

    const siblings = parent.children ?? [];
    const index = targetItem.state === 'expanded' ? 0 : siblings.indexOf(targetItem) + 1;
    const copy = { ...structuredClone(dragItem), parent, level: (parent.level ?? 0) + 1 };
    parent.children = [...siblings.slice(0, index), copy, ...siblings.slice(index)];
    this.siteList = [...this.siteList];
  }

  protected allowDropOnSite(dragItem: CdkDrag<TreeItem>): boolean {
    // Only device templates (leaves) from the catalog can be copied
    return dragItem.data.state === 'leaf';
  }

  private isValidDrop(
    source: TreeItem | undefined,
    target: TreeItem | undefined
  ): target is TreeItem {
    if (!target || source?.state !== 'leaf') {
      return false;
    }
    // Drop into a building (expanded level-1 node) or next to a device inside one
    if (target.state === 'expanded' && target.level === 1) {
      return true;
    }
    if (target.state === 'leaf' && target.level === 2) {
      return true;
    }
    return false;
  }
}
