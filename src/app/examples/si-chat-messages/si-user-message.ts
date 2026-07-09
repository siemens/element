/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { elementCopy, elementDelete, elementEdit, elementExport } from '@siemens/element-icons';
import {
  MARKDOWN_RENDERER,
  SiChatMessageComponent,
  Attachment,
  MessageAction
} from '@siemens/element-ng/chat-messages';
import { addIcons } from '@siemens/element-ng/icon';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatMessageComponent],
  templateUrl: './si-user-message.html',
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
    elementEdit,
    elementExport,
    elementCopy,
    elementDelete
  });

  content = `Can you help me with this **code snippet**?

\`console.log('Hello World')\`

I'm getting an error when I run it.`;

  attachments: Attachment[] = [
    {
      name: 'error-log.txt'
    },
    {
      name: 'screenshot.png'
    }
  ];

  actions: MessageAction[] = [
    {
      label: 'Edit message',
      icon: this.icons.elementEdit,
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    },
    {
      label: 'Copy message',
      icon: this.icons.elementExport,
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      label: 'Delete message',
      icon: this.icons.elementDelete,
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];
}
