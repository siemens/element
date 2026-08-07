/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import {
  SiUserMessageComponent,
  Attachment,
  MessageAction
} from '@siemens/element-ng/chat-messages';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';
import { LOG_EVENT } from '@siemens/live-preview';

import { markdownOptions } from './markdown-options';

@Component({
  selector: 'app-sample',
  imports: [SiUserMessageComponent, SiMarkdownComponent],
  templateUrl: './si-user-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  protected markdownOptions = markdownOptions;

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
      icon: 'element-edit',
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    },
    {
      label: 'Copy message',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      label: 'Delete message',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];
}
