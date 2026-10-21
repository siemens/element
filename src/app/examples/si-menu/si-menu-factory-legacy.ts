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
  elementRestore
} from '@siemens/element-icons';
import { MenuItem } from '@siemens/element-ng/common';
import { addIcons } from '@siemens/element-ng/icon';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiMenuModule, CdkContextMenuTrigger, CdkMenuTrigger],
  templateUrl: './si-menu-factory-legacy.html'
})
export class SampleComponent {
  readonly icons = addIcons({
    elementChat,
    elementCopy,
    elementCut,
    elementDelete,
    elementExport,
    elementRestore
  });

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  readonly items = signal<MenuItem[]>([
    { title: 'Cut', icon: this.icons.elementCut, action: () => alert('Cut') },
    { title: 'Copy', icon: this.icons.elementCopy, action: () => alert('Copy') },
    {
      title: 'Paste as',
      items: [
        { title: 'Plain text', action: () => alert('Plain text') },
        { title: 'Keep formatting', action: () => alert('Keep formatting') }
      ]
    },
    { title: 'Delete', icon: this.icons.elementDelete, action: () => alert('Delete') },
    { title: '-' },
    { title: 'Rename', action: () => alert('Rename') },
    { title: 'Share', disabled: true },
    { title: 'Archive', disabled: true },
    {
      title: 'Show archived',
      type: 'check',
      selectionState: 'check',
      action: () => this.toggleArchived()
    },
    { title: '-' },
    { title: 'View as', isHeading: true },
    { title: 'Table', selectionState: 'radio', type: 'radio', action: () => this.setView('Table') },
    { title: 'Cards', selectionState: '', type: 'radio', action: () => this.setView('Cards') },
    {
      title: 'Timeline',
      selectionState: '',
      type: 'radio',
      action: () => this.setView('Timeline')
    },
    { title: '-' },
    {
      title: 'Comments',
      icon: this.icons.elementChat,
      badge: 3,
      badgeColor: 'info',
      action: () => alert('Comments')
    },
    {
      title: 'Version history',
      icon: this.icons.elementRestore,
      action: () => alert('Version history')
    },
    { title: '-' },
    {
      title: 'Export as',
      icon: this.icons.elementExport,
      items: [
        { title: 'Image', action: () => alert('Image') },
        { title: 'File', action: () => alert('File') },
        {
          title: 'Other',
          items: [{ title: 'Zip', action: () => alert('Zip') }]
        }
      ]
    }
  ]);

  toggleArchived(): void {
    this.items.update(items =>
      items.map(item =>
        item.type === 'check'
          ? { ...item, selectionState: item.selectionState === 'check' ? '' : 'check' }
          : item
      )
    );
  }

  setView(view: string): void {
    this.items.update(items =>
      items.map(item =>
        item.type === 'radio'
          ? { ...item, selectionState: item.title === view ? 'radio' : '' }
          : item
      )
    );
  }
}
