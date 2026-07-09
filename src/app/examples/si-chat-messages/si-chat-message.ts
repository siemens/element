/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  elementBookmark,
  elementDelete,
  elementEdit,
  elementExport,
  elementUser
} from '@siemens/element-icons';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import {
  MARKDOWN_RENDERER,
  SiChatMessageComponent,
  Attachment,
  MessageAction
} from '@siemens/element-ng/chat-messages';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatMessageComponent, SiIconComponent, SiAvatarComponent],
  templateUrl: './si-chat-message.html',
  providers: [
    {
      provide: MARKDOWN_RENDERER,
      useFactory: (sanitizer: DomSanitizer) => getMarkdownRenderer(sanitizer),
      deps: [DomSanitizer]
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  protected readonly icons = addIcons({
    elementUser,
    elementExport,
    elementEdit,
    elementBookmark,
    elementDelete
  });

  actions: MessageAction[] = [
    {
      label: 'Copy',
      icon: this.icons.elementExport,
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
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

  attachments: Attachment[] = [{ name: 'error-log.txt' }, { name: 'screenshot.png' }];
}
