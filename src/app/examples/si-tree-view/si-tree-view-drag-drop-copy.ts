/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  reorderTreeItem,
  SiTreeViewComponent,
  SiTreeViewItemComponent,
  SiTreeViewItemDirective,
  transferTreeItem,
  TreeItem
} from '@siemens/element-ng/tree-view';

const templateCatalog: TreeItem[] = [
  {
    label: 'HVAC',
    icon: 'element-air',
    state: 'expanded',
    customData: { locatorId: 'cat-hvac' },
    children: [
      { label: 'Temperature sensor', icon: 'element-temperature', state: 'leaf' },
      { label: 'HVAC unit', icon: 'element-vrf', state: 'leaf' },
      { label: 'Air quality sensor', icon: 'element-indoor-air-quality', state: 'leaf' }
    ]
  },
  {
    label: 'Lighting',
    icon: 'element-sun',
    state: 'expanded',
    customData: { locatorId: 'cat-lighting' },
    children: [
      { label: 'LED panel', icon: 'element-light', state: 'leaf' },
      { label: 'Motion sensor', icon: 'element-occupancy-sensor', state: 'leaf' }
    ]
  },
  {
    label: 'Security',
    icon: 'element-lock',
    state: 'expanded',
    customData: { locatorId: 'cat-security' },
    children: [
      { label: 'Security camera', icon: 'element-security-cam', state: 'leaf' },
      { label: 'Door sensor', icon: 'element-door', state: 'leaf' }
    ]
  }
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
  templateUrl: './si-tree-view-drag-drop-copy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
// NOTE: This example is to demonstrate CDK drag drop API capabilities with SiTreeViewItemNextComponent
// and it is not yet production ready.
export class SampleComponent {
  protected catalogList = templateCatalog;
  protected siteList = siteConfiguration;

  protected itemDroppedOnSite(event: CdkDragDrop<TreeItem[]>): void {
    let targetIndex = event.currentIndex - 1;
    if (event.container === event.previousContainer) {
      targetIndex =
        event.currentIndex < event.previousIndex ? event.currentIndex - 1 : event.currentIndex;
    }

    const dragItem = event.previousContainer.data[event.previousIndex];
    const targetItem = event.container.data[targetIndex];

    if (!this.isValidDrop(dragItem, targetItem)) {
      return;
    }
    if (event.container === event.previousContainer) {
      this.siteList = [...reorderTreeItem(this.siteList, event)];
    } else {
      const updated = transferTreeItem(this.catalogList, this.siteList, event, false);
      this.catalogList = [...updated.sourceTree];
      this.siteList = [...updated.targetTree];
    }
  }

  protected allowDropOnSite(dragItem: CdkDrag<TreeItem>): boolean {
    // Only device templates (leaves) from the catalog can be copied
    return dragItem.data.state === 'leaf';
  }

  private isValidDrop(source: TreeItem, target: TreeItem): boolean {
    if (!target || source.state !== 'leaf') {
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
