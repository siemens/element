/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { SiAttachmentListComponent, Attachment } from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAttachmentListComponent],
  templateUrl: './si-attachment-list.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');

  attachments: Attachment[] = [
    {
      id: 'file1',
      name: 'quarterly-report.xlsx',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      id: 'file2',
      name: 'screenshot.png',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      id: 'file3',
      name: 'very-long-filename-that-demonstrates-text-truncation-behavior.pdf',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      id: 'file4',
      name: 'data.csv',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      id: 'file5',
      name: 'audio.mp3',
      previewTemplate: () => this.modalTemplate()!
    }
  ];

  readOnlyAttachments: Attachment[] = [
    {
      id: 'readonly1',
      name: 'final-report.docx',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      id: 'readonly2',
      name: 'diagram.jpg',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      id: 'readonly3',
      name: 'config.json',
      previewTemplate: () => this.modalTemplate()!
    }
  ];

  onRemoveAttachment(attachment: Attachment): void {
    this.logEvent(`Remove attachment: ${attachment.id}`);

    this.attachments = this.attachments.filter(a => a.id !== attachment.id);
  }
}
