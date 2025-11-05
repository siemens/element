/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import {
  SiChatMessageComponent,
  SiAttachmentListComponent,
  Attachment,
  SiChatMessageActionDirective,
  MessageAction
} from '@siemens/element-ng/chat-messages';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiMarkdownRendererComponent } from '@siemens/element-ng/markdown-renderer';
import { MenuItemAction, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe } from '@siemens/element-translate-ng';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    CdkMenuTrigger,
    SiChatMessageComponent,
    SiMarkdownRendererComponent,
    SiIconComponent,
    SiAvatarComponent,
    SiAttachmentListComponent,
    SiChatMessageActionDirective,
    SiMenuFactoryComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-chat-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  actions: MessageAction[] = [
    {
      label: 'Copy',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      label: 'Edit',
      icon: 'element-edit',
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    }
  ];

  secondaryActions: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Bookmark',
      icon: 'element-bookmark',
      action: (messageId: string) => this.logEvent(`Bookmark message ${messageId}`)
    },
    {
      type: 'action',
      label: 'Delete',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];

  attachments: Attachment[] = [
    {
      name: 'error-log.txt'
    },
    {
      name: 'screenshot.png'
    }
  ];

  readonly secondaryActionsLabel = 'More actions';
}
