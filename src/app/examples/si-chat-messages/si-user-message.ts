/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import {
  SiUserMessageComponent,
  AttachmentItem,
  ActionBarItem
} from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiUserMessageComponent],
  templateUrl: './si-user-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  content = `Can you help me with this **code snippet**?

\`console.log('Hello World')\`

I'm getting an error when I run it.`;

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

  actions: ActionBarItem[] = [
    {
      id: 'edit',
      label: 'Edit message',
      icon: 'element-edit',
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    },
    {
      id: 'copy',
      label: 'Copy message',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      id: 'delete',
      label: 'Delete message',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];
}
