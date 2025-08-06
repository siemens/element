/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import {
  MenuItemCheckbox,
  MenuItem,
  MenuItemRadio,
  SiMenuFactoryComponent
} from '@spike-rabbit/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [CdkContextMenuTrigger, CdkMenuTrigger, SiMenuFactoryComponent],
  templateUrl: './si-menu-factory.html'
})
export class SampleComponent {
  items: MenuItem[] = [
    { type: 'header', label: 'Actions' },
    {
      type: 'group',
      label: 'Download as',
      children: [
        { type: 'action', label: 'Image', action: () => alert('Image') },
        { type: 'action', label: 'File', action: () => alert('File') },
        {
          type: 'group',
          label: 'Other',
          disabled: true,
          children: [{ type: 'action', label: 'Zip', action: () => alert('Zip') }]
        }
      ]
    },
    { type: 'action', label: 'Clear', action: () => alert('Clear') },
    { type: 'action', label: 'Hide', action: () => alert('Hide') },
    { type: 'action', label: 'Update', action: () => alert('Update') },
    { type: 'divider' },
    {
      type: 'checkbox',
      label: 'Be awesome',
      checked: true,
      action: () => this.toggleAwesome()
    },
    { type: 'action', label: 'Do nothing', disabled: true, action: () => {} },
    {
      type: 'group',
      label: 'Disabled menu',
      disabled: true,
      children: [
        { type: 'action', label: 'Items 1', action: () => {} },
        { type: 'action', label: 'Items 2', action: () => {} }
      ]
    },
    {
      type: 'group',
      label: 'Menu with disabled children',
      disabled: false,
      children: [
        { type: 'action', label: 'Items 1', disabled: true, action: () => {} },
        { type: 'action', label: 'Items 2', disabled: true, action: () => {} }
      ]
    },
    { type: 'divider' },
    { type: 'radio', label: 'Beer', checked: true, action: () => this.setBeverage(1) },
    { type: 'radio', label: 'Whisky', checked: false, action: () => this.setBeverage(2) },
    { type: 'radio', label: 'Gin', checked: false, action: () => this.setBeverage(3) },
    { type: 'divider' },
    {
      type: 'action',
      label: 'Import',
      badge: 5,
      badgeColor: 'danger',
      action: () => alert('Import')
    },
    { type: 'action', label: 'Export', icon: 'element-export', action: () => alert('Export') },
    { type: 'divider' },
    {
      type: 'group',
      label: 'Save as',
      children: [
        { type: 'action', label: 'Image', action: () => alert('Image') },
        { type: 'action', label: 'File', action: () => alert('File') },
        {
          type: 'group',
          label: 'Other',
          children: [{ type: 'action', label: 'Zip', action: () => alert('Zip') }]
        }
      ]
    }
  ];

  toggleAwesome(): void {
    const item = this.items[6] as MenuItemCheckbox;
    item.checked = !item.checked;
  }

  setBeverage(num: number): void {
    (this.items[11] as MenuItemRadio).checked = num === 1;
    (this.items[12] as MenuItemRadio).checked = num === 2;
    (this.items[13] as MenuItemRadio).checked = num === 3;
  }
}
