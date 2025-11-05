/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, inject, input, output, TemplateRef } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiModalService } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

/**
 * Attachment item interface for file attachments in chat messages.
 *
 * @experimental
 */
export interface Attachment {
  /** File name */
  name: string;
  /** Optionally show a preview of the attachment by providing a template that is shown in a modal when clicked (optional) */
  previewTemplate?: TemplateRef<any> | (() => TemplateRef<any>);
}

/**
 * Attachment list component for displaying file attachments in chat messages.
 *
 * This component renders a list of file attachments with icons, names, and optional
 * preview and remove functionality. It's designed to work with chat message components
 * to show files that have been uploaded or shared in conversations.
 *
 * @remarks
 * This component provides:
 * - Automatic file type detection with appropriate icons
 * - Optional preview modal for attachments
 * - Optional remove functionality for editable messages
 * - Flexible alignment (start/end) to match message alignment
 * - Support for various file types (images, videos, audio, documents, archives)
 *
 * The component is typically used within {@link SiUserMessageComponent} or {@link SiAiMessageComponent}
 * to display uploaded files, but can also be used standalone.
 *
 * @example
 * Basic usage with attachments:
 * ```html
 * <si-attachment-list [attachments]="files" />
 * ```
 *
 * @example
 * With remove functionality and custom alignment:
 * ```typescript
 * import { Component } from '@angular/core';
 * import { SiAttachmentListComponent, Attachment } from '@siemens/element-ng/chat-messages';
 *
 * @Component({
 *   selector: 'app-chat',
 *   imports: [SiAttachmentListComponent],
 *   template: `
 *     <si-attachment-list
 *       [attachments]="attachments"
 *       [alignment]="'end'"
 *       [removable]="true"
 *       (remove)="handleRemove($event)"
 *     />
 *   `
 * })
 * export class ChatComponent {
 *   attachments: Attachment[] = [
 *     { id: '1', name: 'report.pdf' },
 *     { id: '2', name: 'image.png', previewTemplate: this.imagePreview }
 *   ];
 *
 *   handleRemove(attachment: Attachment) {
 *     this.attachments = this.attachments.filter(a => a !== attachment);
 *   }
 * }
 * ```
 *
 * @see {@link SiUserMessageComponent} for user message display
 * @see {@link SiAiMessageComponent} for AI message display
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
        inputValues: { 'attachment': attachment }
      });
    }
  }

  protected getFileIcon(name: string): string {
    // TODO: Accept map and default it in file upload directive.
    return 'element-document';
  }
}
