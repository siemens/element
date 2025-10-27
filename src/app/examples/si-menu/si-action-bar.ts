/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiActionBarComponent, MenuItemAction, ActionBarItem } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiActionBarComponent],
  templateUrl: './si-action-bar.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  actions: ActionBarItem[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy action: ${messageId}`)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'element-edit',
      disabled: true,
      action: (messageId: string) => this.logEvent(`Edit action: ${messageId}`)
    },
    {
      id: 'share',
      label: 'Share',
      icon: 'element-share',
      action: (messageId: string) => this.logEvent(`Share action: ${messageId}`)
    }
  ];

  secondaryActions: MenuItemAction[] = [
    {
      type: 'action',
      id: 'bookmark',
      label: 'Bookmark',
      icon: 'element-bookmark',
      action: (messageId: string) => this.logEvent(`Bookmark: ${messageId}`)
    },
    {
      type: 'action',
      id: 'download',
      label: 'Download',
      icon: 'element-download',
      action: (messageId: string) => this.logEvent(`Download: ${messageId}`)
    },
    {
      type: 'action',
      id: 'delete',
      label: 'Delete',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete: ${messageId}`)
    }
  ];
}
