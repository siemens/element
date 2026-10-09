/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import {
  elementBookmark,
  elementDelete,
  elementEdit,
  elementExport,
  elementOptionsVertical,
  elementUser
} from '@siemens/element-icons';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import {
  SiChatMessageComponent,
  SiAttachmentListComponent,
  Attachment,
  SiChatMessageActionDirective
} from '@siemens/element-ng/chat-messages';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';
import {
  MenuItemAction,
  SiMenuActionService,
  SiMenuFactoryComponent
} from '@siemens/element-ng/menu';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { LOG_EVENT } from '@siemens/live-preview';

import { markdownOptions } from './markdown-options';

@Component({
  selector: 'app-sample',
  imports: [
    CdkMenuTrigger,
    SiChatMessageComponent,
    SiMarkdownComponent,
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
  private readonly menuActionService = inject(SiMenuActionService, { optional: true });

  protected markdownOptions = markdownOptions;

  protected readonly icons = addIcons({
    elementUser,
    elementOptionsVertical,
    elementExport,
    elementEdit,
    elementBookmark,
    elementDelete
  });

  actions: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Copy',
      icon: this.icons.elementExport,
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      type: 'action',
      label: 'Edit',
      icon: this.icons.elementEdit,
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    }
  ];

  secondaryActions: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Bookmark',
      icon: this.icons.elementBookmark,
      action: (messageId: string) => this.logEvent(`Bookmark message ${messageId}`)
    },
    {
      type: 'action',
      label: 'Delete',
      icon: this.icons.elementDelete,
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

  protected runAction(action: MenuItemAction, messageId: string): void {
    if (typeof action.action === 'function') {
      action.action(messageId, action);
    } else {
      this.menuActionService?.actionTriggered(action, messageId);
    }
  }
}
