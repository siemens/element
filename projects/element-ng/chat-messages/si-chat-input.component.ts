/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  booleanAttribute,
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
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { ActionBarItem, SiActionBarComponent } from './si-action-bar.component';
import { SiAttachmentListComponent, AttachmentItem } from './si-attachment-list.component';

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
    SiTranslatePipe,
    SiAttachmentListComponent,
    SiActionBarComponent
  ],
  templateUrl: './si-chat-input.component.html',
  styleUrl: './si-chat-input.component.scss'
})
export class SiChatInputComponent implements AfterViewInit {
  @ViewChild('textInput', { static: false }) textInput!: ElementRef<HTMLTextAreaElement>;

  /** Parameter to pass to action handlers */
  readonly actionParam = input<any>();

  /** The label for the input, e.g. "Your message" */
  readonly label = input<string>();

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
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether a message is currently being sent
   * @defaultValue false
   */
  readonly sending = input(false, { transform: booleanAttribute });

  /**
   * Maximum number of characters allowed
   */
  readonly maxLength = input<number>();

  /**
   * A disclaimer to display.
   */
  readonly disclaimer = input<TranslatableString>();

  /**
   * Primary actions available in the input (attach files, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<ActionBarItem[]>([]);

  /**
   * Secondary actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItemAction[]>([]);

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
   * t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
   * ```
   */
  readonly removeAttachmentLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
  );

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
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

  protected get attachmentList(): AttachmentItem[] {
    return this.attachments() as AttachmentItem[];
  }

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

    this.attachments.update(current => [...current, attachment]);
    this.attachmentsChange.emit(this.attachments());
  }

  protected removeAttachment(id: string): void {
    this.attachments.update(current => {
      return current.filter(a => a.id !== id);
    });
    this.attachmentsChange.emit(this.attachments());
  }

  ngAfterViewInit(): void {
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

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight =
      parseInt(computedStyle.lineHeight, 10) || parseInt(computedStyle.fontSize, 10) * 1.2;
    const paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
    const paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
    const minHeight = lineHeight + paddingTop + paddingBottom;

    const viewportHeight = window.innerHeight;
    const maxViewportHeight = viewportHeight * 0.3;
    const maxLinesHeight = lineHeight * 8;
    const maxHeight = Math.min(maxViewportHeight, maxLinesHeight);

    const scrollHeight = textarea.scrollHeight;
    const finalHeight = Math.max(Math.min(scrollHeight, maxHeight), minHeight);
    textarea.style.height = finalHeight + 'px';
  }
}
