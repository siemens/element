/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

export interface AttachmentItem {
  /** Unique identifier for the attachment */
  id: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  type?: string;
  /** File object */
  file?: File;
  /** Preview URL for images */
  previewUrl?: string;
}

@Component({
  selector: 'si-attachment-list',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-attachment-list.component.html',
  styleUrl: './si-attachment-list.component.scss'
})
export class SiAttachmentListComponent {
  /**
   * List of attachments to display
   * @defaultValue []
   */
  readonly attachments = input<AttachmentItem[]>([]);

  /**
   * Whether to show remove buttons on attachments
   * @defaultValue true
   */
  readonly showRemoveButton = input(true);

  /**
   * Label for remove attachment button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
   * ```
   */
  readonly removeAttachmentLabel = input(
    t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
  );

  /**
   * Emitted when an attachment should be removed
   */
  readonly removeAttachment = output<string>();

  protected onRemoveAttachment(attachmentId: string): void {
    this.removeAttachment.emit(attachmentId);
  }
}
