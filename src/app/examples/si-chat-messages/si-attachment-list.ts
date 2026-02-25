/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { SiAttachmentListComponent, Attachment } from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAttachmentListComponent],
  templateUrl: './si-attachment-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');

  attachments: Attachment[] = [
    {
      name: 'quarterly-report.xlsx',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      name: 'screenshot.png',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      name: 'very-long-filename-that-demonstrates-text-truncation-behavior.pdf',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      name: 'data.csv',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      name: 'audio.mp3',
      previewTemplate: () => this.modalTemplate()!
    }
  ];

  readOnlyAttachments: Attachment[] = [
    {
      name: 'final-report.docx',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      name: 'diagram.jpg',
      previewTemplate: () => this.modalTemplate()!
    },
    {
      name: 'config.json',
      previewTemplate: () => this.modalTemplate()!
    }
  ];

  noPreviewAttachments: Attachment[] = [
    {
      name: 'budget-quarterly.pptx',
    },
    {
      name: 'data.json',
    },
    {
      name: 'barchart.png',
    },
    {
      name: 'event.ics',
    }
  ];

  onRemoveAttachment(attachment: Attachment): void {
    this.logEvent(`Remove attachment: ${attachment.name}`);

    this.attachments = this.attachments.filter(a => a !== attachment);
  }
}
