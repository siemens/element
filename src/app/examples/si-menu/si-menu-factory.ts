/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, signal } from '@angular/core';
import {
  elementChat,
  elementCopy,
  elementCut,
  elementDelete,
  elementExport,
  elementOptionsVertical,
  elementRestore
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [CdkContextMenuTrigger, CdkMenuTrigger, SiMenuFactoryComponent, SiIconComponent],
  templateUrl: './si-menu-factory.html'
})
export class SampleComponent {
  readonly icons = addIcons({
    elementChat,
    elementCopy,
    elementCut,
    elementDelete,
    elementExport,
    elementOptionsVertical,
    elementRestore
  });

  readonly items = signal<MenuItem[]>([
    { type: 'action', label: 'Cut', icon: this.icons.elementCut, action: () => alert('Cut') },
    { type: 'action', label: 'Copy', icon: this.icons.elementCopy, action: () => alert('Copy') },
    {
      type: 'group',
      label: 'Paste as',
      children: [
        { type: 'action', label: 'Plain text', action: () => alert('Plain text') },
        { type: 'action', label: 'Keep formatting', action: () => alert('Keep formatting') }
      ]
    },
    {
      type: 'action',
      label: 'Delete',
      icon: this.icons.elementDelete,
      action: () => alert('Delete')
    },
    { type: 'divider' },
    { type: 'action', label: 'Rename', action: () => alert('Rename') },
    { type: 'action', label: 'Share', disabled: true, action: () => {} },
    { type: 'action', label: 'Archive', disabled: true, action: () => {} },
    {
      type: 'checkbox',
      label: 'Show archived',
      checked: true,
      action: () => this.toggleArchived()
    },
    { type: 'divider' },
    { type: 'header', label: 'View as' },
    { type: 'radio', label: 'Table', checked: true, action: () => this.setView('Table') },
    { type: 'radio', label: 'Cards', checked: false, action: () => this.setView('Cards') },
    { type: 'radio', label: 'Timeline', checked: false, action: () => this.setView('Timeline') },
    { type: 'divider' },
    {
      type: 'action',
      label: 'Comments',
      icon: this.icons.elementChat,
      badge: 3,
      badgeColor: 'info',
      action: () => alert('Comments')
    },
    {
      type: 'action',
      label: 'Version history',
      icon: this.icons.elementRestore,
      action: () => alert('Version history')
    },
    { type: 'divider' },
    {
      type: 'group',
      label: 'Export as',
      icon: this.icons.elementExport,
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
  ]);

  toggleArchived(): void {
    this.items.update(items =>
      items.map(item => (item.type === 'checkbox' ? { ...item, checked: !item.checked } : item))
    );
  }

  setView(view: string): void {
    this.items.update(items =>
      items.map(item => (item.type === 'radio' ? { ...item, checked: item.label === view } : item))
    );
  }
}
