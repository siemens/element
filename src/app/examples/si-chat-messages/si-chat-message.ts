/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import {
  SiChatMessageComponent,
  SiActionBarComponent,
  SiAttachmentListComponent,
  ActionBarItem,
  AttachmentItem,
  SiMarkdownContentComponent
} from '@siemens/element-ng/chat-messages';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiChatMessageComponent,
    SiMarkdownContentComponent,
    SiIconComponent,
    SiAvatarComponent,
    SiActionBarComponent,
    SiAttachmentListComponent
  ],
  templateUrl: './si-chat-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  actions: ActionBarItem[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'element-edit',
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    }
  ];

  dropdownActions: MenuItemAction[] = [
    {
      type: 'action',
      id: 'bookmark',
      label: 'Bookmark',
      icon: 'element-bookmark',
      action: (messageId: string) => this.logEvent(`Bookmark message ${messageId}`)
    },
    {
      type: 'action',
      id: 'delete',
      label: 'Delete',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];

  attachments: AttachmentItem[] = [
    {
      id: 'file1',
      name: 'error-log.txt'
    },
    {
      id: 'file2',
      name: 'screenshot.png'
    }
  ];
}
