/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, inject, input, output } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiModalService } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { Attachment } from './chat-message.model';

/**
 * Attachment list component for displaying file attachments in chat messages.
 *
 * This component renders a list of file attachments with icons, names, and optional
 * preview and remove functionality. It's designed to work with chat message components
 * to show files that have been uploaded or shared in conversations.
 *
 * This component provides:
 * - A list of pills showing each attachment's name and an icon
 * - Optional preview modal for attachments
 * - Optional remove functionality for editable messages
 *
 * The component is included within {@link SiUserMessageComponent}, {@link SiAiMessageComponent} and {@link SiChatInputComponent} but can also be used inside custom chat messages with {@link SiChatMessageComponent}
 *
 * @see {@link SiUserMessageComponent} for user message display
 * @see {@link SiAiMessageComponent} for AI message display
 * @see {@link SiChatMessageComponent} for custom chat message display
 * @see {@link SiChatInputComponent} for chat input with attachment support
 * @see {@link Attachment} for attachment data structure
 *
 * @experimental
 */
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
  readonly attachments = input<Attachment[]>([]);

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
  readonly remove = output<Attachment>();

  private getPreviewTemplate(attachment: Attachment): any | undefined {
    if (attachment.previewTemplate) {
      return typeof attachment.previewTemplate === 'function'
        ? attachment.previewTemplate()
        : attachment.previewTemplate;
    }
    return undefined;
  }

  protected openPreview(event: Event, attachment: Attachment): void {
    const template = this.getPreviewTemplate(attachment);
    if (template) {
      event.preventDefault();
      this.modalService.show(template, {
        inputValues: { 'attachment': attachment },
        ignoreBackdropClick: false
      });
    }
  }

  protected getFileIcon(name: string): string {
    // TODO: Accept map and default it in file upload directive.
    return 'element-document';
  }
}
