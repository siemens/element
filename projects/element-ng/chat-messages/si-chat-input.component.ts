/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  afterRenderEffect,
  AfterViewInit,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  elementAttachment,
  elementCancel,
  elementOk,
  elementPlus,
  elementSendFilled,
  elementStopFilled,
  elementVoice
} from '@siemens/element-icons';
import {
  SiFileUploadDirective,
  UploadFile,
  FileUploadError
} from '@siemens/element-ng/file-uploader';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { Attachment, SiAttachmentListComponent } from './si-attachment-list.component';

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
    SiFileUploadDirective,
    SiTooltipDirective
  ],
  templateUrl: './si-chat-input.component.html',
  styleUrl: './si-chat-input.component.scss'
})
export class SiChatInputComponent implements AfterViewInit {
  private static idCounter = 0;
  private readonly textInput = viewChild<ElementRef<HTMLTextAreaElement>>('textInput');
  private readonly voiceButton = viewChild<ElementRef<HTMLButtonElement>>('voiceButton');
  private readonly submitButton = viewChild<ElementRef<HTMLButtonElement>>('submitButton');
  private readonly fileUploadDirective = viewChild(SiFileUploadDirective);
  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly icons = addIcons({
    elementAttachment,
    elementCancel,
    elementOk,
    elementPlus,
    elementSendFilled,
    elementStopFilled,
    elementVoice
  });

  /**
   * Current input value
   * @defaultValue ''
   */
  readonly value = model<string>('');

  /**
   * Whether voice input controls are available. Speech recognition is managed by the consumer.
   * @defaultValue false
   */
  readonly voiceInput = input(false, { transform: booleanAttribute });

  /**
   * Consumer-controlled voice input state. Use listening while awaiting speech and recording
   * when transcription starts. Stream transcript updates through {@link value}.
   * @defaultValue 'idle'
   */
  readonly voiceInputState = input<'idle' | 'listening' | 'recording'>('idle');

  /**
   * Start dictation button label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.START_DICTATION:Start dictation`)
   * ```
   */
  readonly startDictationLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.START_DICTATION:Start dictation`)
  );

  /**
   * Cancel dictation button label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.CANCEL_DICTATION:Cancel dictation`)
   * ```
   */
  readonly cancelDictationLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.CANCEL_DICTATION:Cancel dictation`)
  );

  /**
   * Confirm dictation button label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.CONFIRM_DICTATION:Confirm dictation`)
   * ```
   */
  readonly confirmDictationLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.CONFIRM_DICTATION:Confirm dictation`)
  );

  /**
   * Placeholder while waiting for speech.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.LISTENING:Listening…`)
   * ```
   */
  readonly listeningLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.LISTENING:Listening…`)
  );

  /** Requests that the consumer start speech recognition. Does not change the state or value. */
  readonly voiceInputStart = output<void>();

  /** Requests that the consumer stop recognition and keep the transcript for review, without sending. */
  readonly voiceInputConfirm = output<void>();

  /** Requests that the consumer stop recognition and restore the draft from before dictation. */
  readonly voiceInputCancel = output<void>();

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
   * Primary actions available in the input. Provide at most one action.
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
   * t(() => $localize`:@@SI_CHAT_INPUT.LABEL:Chat input`)
   * ```
   */
  readonly label = input<string>(t(() => $localize`:@@SI_CHAT_INPUT.LABEL:Chat input`));

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
   * @defaultValue this.icons.elementSendFilled
   */
  readonly sendButtonIcon = input(this.icons.elementSendFilled);

  /**
   * Interrupt button label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.INTERRUPT:Stop processing`)
   * ```
   */
  readonly interruptButtonLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.INTERRUPT:Stop processing`)
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
   * Remove attachment aria label.
   * The attachment name is available with `{{attachment}}`.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove {{attachment}}`)
   * ```
   */
  readonly removeAttachmentLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove {{attachment}}`)
  );

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.SECONDARY_ACTIONS:Additional actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.SECONDARY_ACTIONS:Additional actions`)
  );

  /**
   * Suggested follow-up prompts to display as pill buttons above the chat input.
   * Use `followUpPromptSelected` to handle selection and update the input value.
   * Typically populated from AI response data and cleared after selection or on send.
   * @defaultValue []
   */
  readonly followUpPrompts = input<string[]>([]);

  /**
   * Emitted when the user selects a follow-up prompt.
   * The emitted value is the text of the selected prompt.
   */
  readonly followUpPromptSelected = output<string>();

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
  protected readonly voiceActive = computed(
    () => this.voiceInput() && this.voiceInputState() !== 'idle'
  );
  protected readonly voiceRecording = computed(
    () => this.voiceActive() && this.voiceInputState() === 'recording'
  );
  protected readonly voiceButtonLabel = computed(() =>
    this.voiceActive() ? this.cancelDictationLabel() : this.startDictationLabel()
  );
  protected readonly hasSecondaryActions = computed(() => this.secondaryActions().length > 0);
  protected readonly combinedMenuActions = computed<MenuItem[]>(() => [
    ...(this.allowAttachments()
      ? [
          {
            type: 'action' as const,
            label: this.attachFileLabel(),
            icon: this.icons.elementAttachment,
            disabled: this.disabled(),
            action: () => this.triggerFileInput()
          } satisfies MenuItem
        ]
      : []),
    ...this.secondaryActions()
  ]);

  protected readonly hasMenuActions = computed(() => this.hasSecondaryActions());

  protected triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }
  protected readonly canSend = computed(
    () =>
      (this.hasContent() || this.hasAttachments()) &&
      !this.disabled() &&
      !this.sending() &&
      !this.voiceActive()
  );

  protected readonly showInterruptButton = computed(
    () => this.interruptible() && !this.voiceActive()
  );
  protected readonly buttonDisabled = computed(() => {
    if (this.voiceActive()) {
      return this.disabled() || !this.voiceRecording();
    }
    if (this.showInterruptButton()) {
      return this.disabled() || this.sending();
    }
    return !this.canSend();
  });
  protected readonly buttonIcon = computed(() =>
    this.voiceRecording()
      ? this.icons.elementOk
      : this.showInterruptButton()
        ? this.icons.elementStopFilled
        : this.sendButtonIcon()
  );
  protected readonly buttonLabel = computed(() =>
    this.voiceRecording()
      ? this.confirmDictationLabel()
      : this.showInterruptButton()
        ? this.interruptButtonLabel()
        : this.sendButtonLabel()
  );

  protected readonly dragOver = signal(false);

  constructor() {
    afterRenderEffect(() => {
      this.value();
      const textarea = this.textInput()?.nativeElement;
      if (textarea) {
        this.setTextareaHeight(textarea);
      }
    });

    let previousState = 'idle';
    afterRenderEffect(() => {
      const state = this.voiceActive() ? this.voiceInputState() : 'idle';
      if (state === previousState) {
        return;
      }
      previousState = state;
      if (this.disabled()) {
        return;
      }
      if (state === 'idle') {
        const textarea = this.textInput()?.nativeElement;
        textarea?.focus();
        textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
      } else {
        const button = state === 'listening' ? this.voiceButton() : this.submitButton();
        button?.nativeElement.focus();
      }
    });
  }

  protected selectFollowUpPrompt(prompt: string): void {
    this.followUpPromptSelected.emit(prompt);
    this.focus();
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
    if (this.disabled()) {
      return;
    }
    if (this.voiceActive()) {
      if (this.voiceRecording()) {
        this.voiceInputConfirm.emit();
      }
      return;
    }
    if (this.showInterruptButton()) {
      this.interrupt.emit();
    } else {
      this.onSend();
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.isComposing || this.disabled()) {
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.voiceActive()) {
        this.onButtonClick();
        return;
      }
      if (!this.canSend()) {
        return;
      }
      if (this.showInterruptButton()) {
        this.interrupt.emit();
      }
      this.onSend();
    }
  }

  protected onVoiceButtonClick(): void {
    if (this.disabled() || (!this.voiceActive() && (this.sending() || this.interruptible()))) {
      return;
    }
    if (this.voiceActive()) {
      this.voiceInputCancel.emit();
    } else {
      this.voiceInputStart.emit();
    }
  }

  protected onVoiceKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.voiceActive() && !this.disabled() && !event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      this.voiceInputCancel.emit();
    }
  }

  protected onFilesAdded(uploadFiles: UploadFile[]): void {
    const validFiles = uploadFiles.filter(uploadFile => uploadFile.status === 'added');

    validFiles.forEach(uploadFile => {
      const size = parseInt(uploadFile.size, 10);
      const attachment: ChatInputAttachment = {
        name: uploadFile.fileName,
        size: isNaN(size) ? uploadFile.file.size : size,
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
      (target.closest('si-attachment-list') && target.closest('.attachment-item'))
    ) {
      return;
    }

    this.focus();
  }

  ngAfterViewInit(): void {
    const textarea = this.textInput();
    if (textarea?.nativeElement) {
      if (this.autoFocus() && !this.voiceActive()) {
        // Use setTimeout to ensure the element is fully rendered
        setTimeout(() => {
          textarea.nativeElement.focus();
        }, 0);
      }
    }
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

  protected dropHandler(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    if (!this.allowAttachments() || this.disabled()) {
      return;
    }

    const directive = this.fileUploadDirective();
    if (directive && event.dataTransfer?.files) {
      directive.handleFiles(event.dataTransfer.files);
    }
  }

  protected dragOverHandler(event: DragEvent): void {
    if (!this.allowAttachments() || this.disabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
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
