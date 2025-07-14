/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiMenuModule, CdkContextMenuTrigger, CdkMenuTrigger],
  templateUrl: './si-menu-factory-legacy.html'
})
export class SampleComponent {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  items: MenuItem[] = [
    { title: 'Actions', isHeading: true },
    {
      title: 'Download as',
      items: [
        { title: 'Image', action: () => alert('Image') },
        { title: 'File', action: () => alert('File') },
        {
          title: 'Other',
          disabled: true,
          items: [{ title: 'Zip', action: () => alert('Zip') }]
        }
      ]
    },
    { title: 'Clear', action: () => alert('Clear') },
    { title: 'Hide', action: () => alert('Hide') },
    { title: 'Update', action: () => alert('Update') },
    { title: '-' },
    {
      title: 'Be awesome',
      selectionState: 'check',
      type: 'check',
      action: () => this.toggleAwesome()
    },
    { title: 'Do nothing', disabled: true },
    {
      title: 'Disabled menu',
      disabled: true,
      items: [{ title: 'Items 1' }, { title: 'Items 2' }]
    },
    {
      title: 'Menu with disabled children',
      disabled: false,
      items: [
        { title: 'Items 1', disabled: true },
        { title: 'Items 2', disabled: true }
      ]
    },
    { title: '-' },
    { title: 'Beer', selectionState: 'radio', type: 'radio', action: () => this.setBeverage(1) },
    { title: 'Whisky', selectionState: '', type: 'radio', action: () => this.setBeverage(2) },
    { title: 'Gin', selectionState: '', type: 'radio', action: () => this.setBeverage(3) },
    { title: '-' },
    { title: 'Import', badge: 5, badgeColor: 'danger', action: () => alert('Import') },
    { title: 'Export', icon: 'element-export', action: () => alert('Export') },
    { title: '-' },
    {
      title: 'Save as',
      items: [
        { title: 'Image', action: () => alert('Image') },
        { title: 'File', action: () => alert('File') },
        {
          title: 'Other',
          items: [{ title: 'Zip', action: () => alert('Zip') }]
        }
      ]
    }
  ];

  toggleAwesome(): void {
    const item = this.items[6];
    item.selectionState = item.selectionState === 'check' ? '' : 'check';
  }

  setBeverage(num: number): void {
    this.items[11].selectionState = num === 1 ? 'radio' : '';
    this.items[12].selectionState = num === 2 ? 'radio' : '';
    this.items[13].selectionState = num === 3 ? 'radio' : '';
  }
}
