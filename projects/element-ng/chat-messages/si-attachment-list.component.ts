/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, inject, input, output, TemplateRef } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiModalService } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

export interface AttachmentItem {
  /** Unique identifier for the attachment */
  id: string;
  /** File name */
  name: string;
  /** Template to show in a modal when clicked (optional) */
  previewTemplate?: TemplateRef<any> | (() => TemplateRef<any>);
}

@Component({
  selector: 'si-attachment-list',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-attachment-list.component.html',
  styleUrl: './si-attachment-list.component.scss'
})
export class SiAttachmentListComponent {
  protected modalService = inject(SiModalService);

  /**
   * List of attachments to display
   * @defaultValue []
   */
  readonly attachments = input<AttachmentItem[]>([]);

  /**
   * Whether to align attachments to the end (right) or start (left)
   * @defaultValue 'start'
   */
  readonly alignment = input<'start' | 'end'>('start');

  /**
   * Whether to show remove buttons on attachments
   * @defaultValue false
   */
  readonly removable = input(false, { transform: booleanAttribute });

  /**
   * Label for remove attachment button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
   * ```
   */
  readonly removeLabel = input(
    t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
  );

  /**
   * Emitted when an attachment should be removed
   */
  readonly remove = output<string>();

  protected getPreviewTemplate(attachment: AttachmentItem): any | undefined {
    if (attachment.previewTemplate) {
      return typeof attachment.previewTemplate === 'function'
        ? attachment.previewTemplate()
        : attachment.previewTemplate;
    }
    return undefined;
  }

  protected getFileIcon(name: string): string {
    const lowerName = name.toLowerCase();
    const suffix = lowerName.split('.').pop() ?? '';

    switch (suffix) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return 'element-image';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'wmv':
      case 'flv':
      case 'mkv':
        return 'element-video';
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return 'element-audio';
      case 'pdf':
        return 'element-document-pdf';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'element-document-zip';
      default:
        return 'element-document';
    }
  }
}
