/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiAttachmentListComponent, AttachmentItem } from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAttachmentListComponent],
  templateUrl: './si-attachment-list.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  attachments: AttachmentItem[] = [
    {
      id: 'file1',
      name: 'quarterly-report.xlsx'
    },
    {
      id: 'file2',
      name: 'screenshot.png'
    },
    {
      id: 'file3',
      name: 'very-long-filename-that-demonstrates-text-truncation-behavior.pdf'
    },
    {
      id: 'file4',
      name: 'data.csv'
    },
    {
      id: 'file5',
      name: 'audio.mp3'
    }
  ];

  readOnlyAttachments: AttachmentItem[] = [
    {
      id: 'readonly1',
      name: 'final-report.docx'
    },
    {
      id: 'readonly2',
      name: 'diagram.jpg'
    },
    {
      id: 'readonly3',
      name: 'config.json'
    }
  ];

  onRemoveAttachment(attachmentId: string): void {
    this.logEvent(`Remove attachment: ${attachmentId}`);

    this.attachments = this.attachments.filter(attachment => attachment.id !== attachmentId);
  }
}
