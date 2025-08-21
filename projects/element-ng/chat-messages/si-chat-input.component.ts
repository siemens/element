/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { SiAttachmentListComponent, AttachmentItem } from './si-attachment-list.component';

export interface ChatInputAction {
  /** Unique identifier for the action */
  id: string;
  /** Label for accessibility */
  label: TranslatableString;
  /** Icon name for the action button */
  icon: string;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Function called when action is triggered */
  action: () => void;
}

export interface ChatInputAttachment extends AttachmentItem {
  /** File object */
  file: File;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
}

@Component({
  selector: 'si-chat-input',
  imports: [
    FormsModule,
    SiIconComponent,
    SiLoadingButtonComponent,
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    SiTranslatePipe,
    SiAttachmentListComponent
  ],
  templateUrl: './si-chat-input.component.html',
  styleUrl: './si-chat-input.component.scss',
  host: {
    class: 'si-chat-input w-100',
    '[class.si-chat-input--has-content]': 'hasContent()',
    '[class.si-chat-input--has-attachments]': 'hasAttachments()',
    '[class.si-chat-input--has-actions]': 'hasActions()',
    '[class.si-chat-input--sending]': 'sending()'
  }
})
export class SiChatInputComponent implements AfterViewInit {
  @ViewChild('textInput', { static: false }) textInput!: ElementRef<HTMLTextAreaElement>;
  /**
   * Current input value
   * @defaultValue ''
   */
  readonly value = signal<string>('');

  /**
   * Placeholder text for the input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Type a message...`)
   * ```
   */
  readonly placeholder = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Type a message...`)
  );

  /**
   * Whether the input is disabled
   * @defaultValue false
   */
  readonly disabled = input(false);

  /**
   * Whether a message is currently being sent
   * @defaultValue false
   */
  readonly sending = input(false);

  /**
   * Maximum number of characters allowed
   */
  readonly maxLength = input<number>();

  /**
   * A legal disclaimer to display.
   */
  readonly disclaimer = input<TranslatableString>();

  /**
   * Primary actions available in the input (attach files, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<ChatInputAction[]>([]);

  /**
   * Secondary actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<ChatInputAction[]>([]);

  /**
   * Whether file attachments are supported
   * @defaultValue false
   */
  readonly allowAttachments = input(false);

  /**
   * Accepted file types for attachments
   * @defaultValue []
   */
  readonly acceptedFileTypes = input<string[]>([]);

  /**
   * Maximum file size in bytes
   * @defaultValue 10485760 (10MB)
   */
  readonly maxFileSize = input(10485760);

  /**
   * Current attachments
   * @defaultValue []
   */
  readonly attachments = signal<ChatInputAttachment[]>([]);

  /**
   * Send button label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.SEND:Send`)
   * ```
   */
  readonly sendButtonLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.SEND:Send`)
  );

  /**
   * Send button icon
   *
   * @defaultValue 'element-send-filled'
   */
  readonly sendButtonIcon = input('element-send-filled');

  /**
   * Auto-focus the input on component initialization
   * @defaultValue true
   */
  readonly autoFocus = input(true);

  /**
   * Emitted when the user wants to send a message
   */
  readonly send = output<{
    content: string;
    attachments: ChatInputAttachment[];
  }>();

  /**
   * Attach file button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.ATTACH_FILE:Attach file`)
   * ```
   */
  readonly attachFileLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.ATTACH_FILE:Attach file`)
  );

  /**
   * Remove attachment aria label prefix
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.REMOVE_ATTACHMENT:Remove`)
   * ```
   */
  readonly removeAttachmentLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.REMOVE_ATTACHMENT:Remove`)
  );

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.MORE_ACTIONS:More actions`)
   * ```
   */
  readonly moreActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.MORE_ACTIONS:More actions`)
  );

  /**
   * Emitted when input value changes
   */
  readonly valueChange = output<string>();

  /**
   * Emitted when attachments change
   */
  readonly attachmentsChange = output<ChatInputAttachment[]>();

  protected readonly hasContent = computed(() => this.value().trim().length > 0);

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);

  protected readonly hasActions = computed(() => this.actions().length > 0);

  protected readonly hasSecondaryActions = computed(() => this.secondaryActions().length > 0);

  protected readonly canSend = computed(
    () => (this.hasContent() || this.hasAttachments()) && !this.disabled() && !this.sending()
  );

  protected onInputChange(value: string): void {
    this.value.set(value);
    this.valueChange.emit(value);
  }

  protected onSend(): void {
    if (this.canSend()) {
      this.send.emit({
        content: this.value(),
        attachments: this.attachments()
      });

      this.value.set('');
      this.attachments.set([]);
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  protected onActionClick(action: ChatInputAction): void {
    if (!action.disabled) {
      action.action();
    }
  }

  protected onFileSelect(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files) {
      Array.from(files).forEach(file => this.addAttachment(file));
    }

    inputElement.value = '';
  }

  protected addAttachment(file: File): void {
    if (file.size > this.maxFileSize()) {
      console.warn(`File "${file.name}" exceeds maximum size limit`);
      return;
    }

    const attachment: ChatInputAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    };

    if (file.type.startsWith('image/')) {
      attachment.previewUrl = URL.createObjectURL(file);
    }

    this.attachments.update(current => [...current, attachment]);
    this.attachmentsChange.emit(this.attachments());
  }

  protected removeAttachment(id: string): void {
    this.attachments.update(current => {
      const attachment = current.find(a => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return current.filter(a => a.id !== id);
    });
    this.attachmentsChange.emit(this.attachments());
  }

  ngAfterViewInit(): void {
    // Set initial height to one line
    if (this.textInput?.nativeElement) {
      this.setTextareaHeight(this.textInput.nativeElement);
    }
  }

  protected adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.setTextareaHeight(textarea);
  }

  private setTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';

    // Calculate minimum height (one line) based on line height
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.2;
    const paddingTop = parseInt(computedStyle.paddingTop) || 0;
    const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
    const minHeight = lineHeight + paddingTop + paddingBottom;

    // Calculate maximum height based on viewport - allow for reasonable growth
    const viewportHeight = window.innerHeight;
    const maxHeight = Math.min(viewportHeight * 0.3, lineHeight * 8); // Max 30% of viewport or 8 lines

    textarea.style.height = Math.max(Math.min(textarea.scrollHeight, maxHeight), minHeight) + 'px';
  }

  protected formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
