/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  AfterViewInit,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SiFileUploadDirective,
  UploadFile,
  FileUploadError
} from '@siemens/element-ng/file-uploader';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { SiAttachmentListComponent, Attachment } from './si-attachment-list.component';

/**
 * Attachment item interface for file attachments in chat messages, extension of {@link Attachment} for {@link SiAttachmentListComponent} to use within {@link SiChatInputComponent}.
 * Adds the action file information.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * @see {@link Attachment} for base attachment interface
 * @see {@link SiAttachmentListComponent} for the attachment list component
 * @see {@link SiChatInputComponent} for the chat input component
 * @see {@link SiChatContainerComponent} for the chat container component
 *
 * @experimental
 */
export interface ChatInputAttachment extends Attachment {
  /** File object */
  file: File;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
}

/**
 * Chat input component for composing and sending messages in conversational interfaces.
 *
 * The chat input component provides a text area for users to compose messages,
 * supporting text, attachments, and contextual actions. It appears as a textarea
 * with buttons for adding attachments and sending messages, as well as an optional disclaimer.
 *
 * The component automatically handles:
 * - Styling for chat input and actions.
 * - Dynamic resizing of the textarea based on content.
 * - Uploading of and displaying of attachments above the input area.
 * - Displaying primary and secondary actions.
 *
 * Additionally to the inputs and outputs documented here, the component supports content projection via the following slots:
 * - Default content: Custom action buttons to display inline, prefer using the `actions` input for buttons, can be used in addition.
 * - `siChatInputDisclaimer` selector: Custom disclaimer content to display below the input area, prefer using the `disclaimer` input for simple text disclaimers.
 *
 * @see {@link SiAttachmentListComponent} for the base attachment component
 * @see {@link SiChatInputDisclaimerDirective} to slot in custom disclaimer content
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-input',
  imports: [
    CdkMenuTrigger,
    FormsModule,
    SiIconComponent,
    SiTranslatePipe,
    SiAttachmentListComponent,
    SiMenuFactoryComponent,
    SiFileUploadDirective
  ],
  templateUrl: './si-chat-input.component.html',
  styleUrl: './si-chat-input.component.scss'
})
export class SiChatInputComponent implements AfterViewInit {
  private static idCounter = 0;
  private readonly textInput = viewChild<ElementRef<HTMLTextAreaElement>>('textInput');
  private readonly projectedContent = viewChild<ElementRef>('projected');

  /**
   * Current input value
   * @defaultValue ''
   */
  readonly value = model<string>('');

  /**
   * Placeholder text for the input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Enter a message…`)
   * ```
   */
  readonly placeholder = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Enter a message…`)
  );

  /**
   * Whether the input is disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether a message is currently being sent, also prevent the sending of new ones while still allowing the user to type
   * @defaultValue false
   */
  readonly sending = input(false, { transform: booleanAttribute });

  /**
   * Whether the input supports interrupting ongoing operations. When active,
   * the send button transforms into an interrupt button (with element-stop-filled icon).
   * If sending is true, the interrupt button will be disabled.
   * @defaultValue false
   */
  readonly interruptible = input(false, { transform: booleanAttribute });

  /**
   * Maximum number of characters allowed
   */
  readonly maxLength = input<number>();

  /**
   * A disclaimer to display.
   *
   * If not provided, the component will look for projected content with the `siChatInputDisclaimer` directive.
   * If both are empty, no disclaimer section will be shown (handled via CSS :empty).
   */
  readonly disclaimer = input<TranslatableString>();

  /**
   * Primary actions available in the input (attach files, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<MessageAction[]>([]);

  /**
   * Secondary actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /**
   * Whether file attachments are supported
   * @defaultValue false
   */
  readonly allowAttachments = input(false);

  /**
   * Accepted file types for attachments (as accept string)
   * @defaultValue undefined
   */
  readonly accept = input<string>();

  /**
   * Maximum file size in bytes
   * @defaultValue 10485760 (10MB)
   */
  readonly maxFileSize = input(10485760);

  /**
   * Current attachments
   * @defaultValue []
   */
  readonly attachments = model<ChatInputAttachment[]>([]);

  /**
   * The label for the input, used for accessibility
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.LABEL:Chat message input`)
   * ```
   */
  readonly label = input<string>(t(() => $localize`:@@SI_CHAT_INPUT.LABEL:Chat message input`));

  /** Parameter to pass to action handlers */
  readonly actionParam = input<any>();

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
   * Interrupt button label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.INTERRUPT:Interrupt`)
   * ```
   */
  readonly interruptButtonLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.INTERRUPT:Interrupt`)
  );

  /**
   * Auto-focus the input on component initialization
   * @defaultValue false
   */
  readonly autoFocus = input(false, { transform: booleanAttribute });

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
   * t(() => $localize`:@@SI_CHAT_INPUT.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.SECONDARY_ACTIONS:More actions`)
  );

  /**
   * Emitted when the user wants to send a message
   */
  readonly send = output<{
    content: string;
    attachments: ChatInputAttachment[];
  }>();

  /**
   * Emitted when the user wants to interrupt the current operation
   */
  readonly interrupt = output<void>();

  /**
   * Emitted when file upload errors occur
   */
  readonly fileError = output<FileUploadError>();

  protected readonly id = `__si-chat-input-${SiChatInputComponent.idCounter++}`;
  protected readonly hasContent = computed(() => this.value().trim().length > 0);
  protected readonly hasAttachments = computed(() => this.attachments().length > 0);
  protected readonly hasActions = computed(() => this.actions().length > 0);
  protected readonly hasSecondaryActions = computed(() => this.secondaryActions().length > 0);
  protected readonly canSend = computed(
    () => (this.hasContent() || this.hasAttachments()) && !this.disabled() && !this.sending()
  );

  protected readonly showInterruptButton = computed(() => this.interruptible());
  protected readonly buttonDisabled = computed(() => {
    if (this.showInterruptButton()) {
      return this.disabled() || this.sending();
    }
    return !this.canSend();
  });
  protected readonly buttonIcon = computed(() =>
    this.showInterruptButton() ? 'element-stop-filled' : this.sendButtonIcon()
  );
  protected readonly buttonLabel = computed(() =>
    this.showInterruptButton() ? this.interruptButtonLabel() : this.sendButtonLabel()
  );

  protected get attachmentList(): Attachment[] {
    return this.attachments() as Attachment[];
  }

  protected onInputChange(value: string): void {
    this.value.set(value);
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

  protected onButtonClick(): void {
    if (this.showInterruptButton()) {
      this.interrupt.emit();
    } else {
      this.onSend();
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.canSend()) {
        return;
      }
      if (this.showInterruptButton()) {
        this.interrupt.emit();
      }
      this.onSend();
    }
  }

  protected onFilesAdded(uploadFiles: UploadFile[]): void {
    const validFiles = uploadFiles.filter(uploadFile => uploadFile.status === 'added');

    validFiles.forEach(uploadFile => {
      const attachment: ChatInputAttachment = {
        name: uploadFile.fileName,
        size: uploadFile.file.size,
        type: uploadFile.file.type,
        file: uploadFile.file
      };

      this.attachments.update(current => [...current, attachment]);
    });
  }

  protected onFileError(error: FileUploadError): void {
    this.fileError.emit(error);
  }

  protected removeAttachment(attachment: Attachment): void {
    this.attachments.update(current => {
      return current.filter(a => a !== attachment);
    });
  }

  protected onContainerClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Don't focus if clicking on interactive elements
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('[siChatMessageAction]') ||
      (target.closest('si-attachment-list') && target.closest('.attachment-item')) ||
      this.projectedContent()?.nativeElement?.contains(target)
    ) {
      return;
    }

    this.focus();
  }

  ngAfterViewInit(): void {
    const textarea = this.textInput();
    if (textarea?.nativeElement) {
      this.setTextareaHeight(textarea.nativeElement);

      if (this.autoFocus()) {
        // Use setTimeout to ensure the element is fully rendered
        setTimeout(() => {
          textarea.nativeElement.focus();
        }, 0);
      }
    }
  }

  protected adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.setTextareaHeight(textarea);
  }

  /**
   * Focus the textarea input
   */
  focus(): void {
    const textarea = this.textInput();
    if (textarea?.nativeElement) {
      textarea.nativeElement.focus();
    }
  }

  private setTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.blockSize = 'auto';

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight =
      parseInt(computedStyle.lineHeight, 10) || parseInt(computedStyle.fontSize, 10) * 1.2;
    const paddingTop = parseInt(computedStyle.paddingBlockStart, 10) || 0;
    const paddingBottom = parseInt(computedStyle.paddingBlockEnd, 10) || 0;
    const minHeight = lineHeight + paddingTop + paddingBottom;

    const viewportHeight = window.innerHeight;
    const maxViewportHeight = viewportHeight * 0.3;
    const maxLinesHeight = lineHeight * 8;
    const maxHeight = Math.min(maxViewportHeight, maxLinesHeight) + paddingTop + paddingBottom;

    const scrollHeight = textarea.scrollHeight;
    const finalHeight = Math.max(Math.min(scrollHeight, maxHeight), minHeight);
    textarea.style.height = finalHeight + 'px';
  }
}
