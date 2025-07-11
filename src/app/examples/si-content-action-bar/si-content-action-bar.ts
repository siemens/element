/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import { MenuItem, MenuItemCheckbox, MenuItemRadio } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiContentActionBarComponent],
  templateUrl: './si-content-action-bar.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  secondaryActions: MenuItem[] = [
    {
      type: 'group',
      label: 'Download as',
      children: [
        { type: 'action', label: 'Image', action: () => alert('Image') },
        { type: 'action', label: 'File', action: () => alert('File') }
      ]
    },
    { type: 'action', label: 'Copy', action: () => alert('Copy') },
    { type: 'action', label: 'Hide', action: () => alert('Hide') },
    { type: 'action', label: 'Export', action: () => alert('Export') },
    { type: 'action', label: 'Favorite', action: () => alert('Favorite') }
  ];

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Create', action: () => alert('Create') },
    {
      type: 'group',
      label: 'Save As',
      children: [
        { type: 'action', label: 'Save as New Trend', action: () => alert('Save as New Trend') },
        { type: 'action', label: 'Save as a Copy', action: () => alert('Save as a Copy') },
        { type: 'action', label: 'Save as a Template', action: () => alert('Save as a Template') }
      ]
    },
    { type: 'action', label: 'Delete', action: () => alert('Delete') }
  ];

  primaryActionsIcons: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Download',
      iconOnly: true,
      action: () => alert('Download'),
      icon: 'element-download'
    },
    { type: 'action', label: 'Share', action: () => alert('Share'), icon: 'element-share' },
    { type: 'action', label: 'Edit', action: () => alert('Edit'), icon: 'element-edit' },
    { type: 'action', label: 'Copy', action: () => alert('Copy'), icon: 'element-copy' }
  ];

  secondaryActionsIcons: MenuItem[] = [
    { type: 'action', label: 'Clear', action: () => alert('Clear') },
    { type: 'action', label: 'Hide', action: () => alert('Hide') },
    { type: 'action', label: 'Update', action: () => alert('Update') },
    { type: 'divider' },
    {
      type: 'checkbox',
      label: 'Be awesome',
      checked: false,
      action: (params: any, source) => this.toggleAwesome(params, source)
    },
    { type: 'divider' },
    {
      type: 'radio',
      label: 'Beer',
      checked: false,
      action: (params, source) => this.setBeverage(1, source)
    },
    {
      type: 'radio',
      label: 'Whisky',
      checked: false,
      action: (params, source) => this.setBeverage(2, source)
    },
    {
      type: 'radio',
      label: 'Gin',
      checked: false,
      action: (params, source) => this.setBeverage(3, source)
    },
    { type: 'divider' },
    { type: 'action', label: 'Import', icon: 'element-import', action: () => alert('Import') },
    { type: 'action', label: 'Export', icon: 'element-export', action: () => alert('Export') }
  ];

  toggleAwesome(params: any, item: MenuItemCheckbox): void {
    this.logEvent(params);
    item.checked = !item.checked;
  }

  setBeverage(num: number, item: MenuItemRadio): void {
    item.checked = num === 1;
    item.checked = num === 2;
    item.checked = num === 3;
  }
}
