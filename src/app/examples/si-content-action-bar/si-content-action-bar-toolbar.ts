/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  templateUrl: './si-content-action-bar-toolbar.html',
  host: { class: 'p-5' },
  imports: [SiContentActionBarComponent]
})
export class SampleComponent {
  secondaryActions: MenuItem[] = [
    {
      type: 'group',
      label: 'Download as',
      children: [
        { type: 'action', label: 'Image', action: () => alert('Image') },
        { type: 'action', label: 'File', action: () => alert('File') }
      ]
    },
    { type: 'action', label: 'Hide', action: () => alert('Hide') },
    { type: 'action', label: 'Export', action: () => alert('Export') },
    { type: 'action', label: 'Favorite', action: () => alert('Favorite') }
  ];

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Cut', icon: 'element-cut', action: () => alert('Cut') },
    { type: 'action', label: 'Copy', icon: 'element-copy', action: () => alert('Copy') },
    { type: 'action', label: 'Paste', icon: 'element-paste', action: () => alert('Paste') },
    { type: 'action', label: 'Delete', icon: 'element-delete', action: () => alert('Delete') },
    {
      type: 'group',
      label: 'History (3)',
      children: [
        { type: 'action', label: 'Previous action 1', action: () => alert('Undo action 1') },
        { type: 'action', label: 'Previous action 2', action: () => alert('Undo action 2') },
        { type: 'action', label: 'Previous action 3', action: () => alert('Undo action 3') }
      ]
    },
    { type: 'action', label: 'Undo', icon: 'element-undo', action: () => alert('Undo') },
    { type: 'action', label: 'Redo', icon: 'element-redo', action: () => alert('Redo') }
  ];

  primaryActionsIcons: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Cut',
      iconOnly: true,
      icon: 'element-cut',
      action: () => alert('Cut')
    },
    {
      type: 'action',
      label: 'Copy',
      iconOnly: true,
      icon: 'element-copy',
      action: () => alert('Copy')
    },
    {
      type: 'action',
      label: 'Paste',
      iconOnly: true,
      icon: 'element-paste',
      action: () => alert('Paste')
    },
    {
      type: 'action',
      label: 'Delete',
      iconOnly: true,
      icon: 'element-delete',
      action: () => alert('Delete')
    },
    {
      type: 'group',
      label: 'History (3)',
      children: [
        { type: 'action', label: 'Previous action 1', action: () => alert('Undo action 1') },
        { type: 'action', label: 'Previous action 2', action: () => alert('Undo action 2') },
        { type: 'action', label: 'Previous action 3', action: () => alert('Undo action 3') }
      ]
    },
    {
      type: 'action',
      label: 'Undo',
      iconOnly: true,
      icon: 'element-undo',
      action: () => alert('Undo')
    },
    {
      type: 'action',
      label: 'Redo',
      iconOnly: true,
      icon: 'element-redo',
      action: () => alert('Redo')
    }
  ];
}
