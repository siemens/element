/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  TemplateRef,
  viewChild
} from '@angular/core';
import { elementCheckedFilled, elementStateClose, elementVoice } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { SiChatInputControl } from './si-chat-input-control';
import { SiChatInputComponent } from './si-chat-input.component';

/**
 * Consumer-owned recognition lifecycle.
 * @experimental
 */
export type ChatInputVoiceState = 'idle' | 'listening' | 'recording' | 'finishing';

/**
 * Optional voice controls projected into {@link SiChatInputComponent}.
 * Does not request microphone permission or manage speech recognition.
 * @experimental
 */
@Component({
  selector: 'si-chat-input-voice',
  imports: [SiIconComponent, SiTooltipDirective, SiTranslatePipe],
  template: `
    <ng-template #controls>
      <button
        #voiceButton
        type="button"
        class="btn btn-tertiary-ghost btn-icon"
        [disabled]="buttonDisabled()"
        [siTooltip]="buttonLabel() | translate"
        [attr.aria-label]="buttonLabel() | translate"
        (click)="onVoiceButtonClick()"
      >
        <si-icon [icon]="active() ? icons.elementStateClose : icons.elementVoice" />
      </button>
      @if (active()) {
        <button
          #confirmButton
          type="button"
          class="btn btn-tertiary-ghost btn-icon"
          [disabled]="chatInput.disabled() || state() !== 'recording'"
          [siTooltip]="
            (state() === 'listening' ? chatInput.sendButtonLabel() : confirmDictationLabel())
              | translate
          "
          [attr.aria-label]="
            (state() === 'listening' ? chatInput.sendButtonLabel() : confirmDictationLabel())
              | translate
          "
          (click)="activate()"
        >
          <si-icon
            class="text-accent"
            [icon]="
              state() === 'listening' ? chatInput.sendButtonIcon() : icons.elementCheckedFilled
            "
          />
        </button>
      }
      <span class="visually-hidden" role="status">{{
        active() ? (placeholder() | translate) : ''
      }}</span>
    </ng-template>
  `,
  providers: [{ provide: SiChatInputControl, useFactory: () => inject(SiChatInputVoiceComponent) }],
  host: { style: 'display: contents' }
})
export class SiChatInputVoiceComponent extends SiChatInputControl {
  protected readonly chatInput = inject(SiChatInputComponent);
  private readonly voiceButton = viewChild<ElementRef<HTMLButtonElement>>('voiceButton');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');
  protected readonly icons = addIcons({ elementCheckedFilled, elementStateClose, elementVoice });

  /**
   * Recognition state controlled by the consumer.
   * @defaultValue 'idle'
   */
  readonly state = input<ChatInputVoiceState>('idle');

  /**
   * Disable starting dictation without disabling typing, sending, or cancellation.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Start button label; can describe permission or availability restrictions.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.START_DICTATION:Start dictation`)
   * ```
   */
  readonly startDictationLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.START_DICTATION:Start dictation`)
  );
  /**
   * Cancel button label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.CANCEL_DICTATION:Cancel dictation`)
   * ```
   */
  readonly cancelDictationLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.CANCEL_DICTATION:Cancel dictation`)
  );
  /**
   * Confirm button label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.CONFIRM_DICTATION:Confirm dictation`)
   * ```
   */
  readonly confirmDictationLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.CONFIRM_DICTATION:Confirm dictation`)
  );
  /**
   * Startup/listening status and placeholder.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.LISTENING:Listening…`)
   * ```
   */
  readonly listeningLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.LISTENING:Listening…`)
  );
  /**
   * Finalization status and placeholder.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.FINISHING:Finishing dictation…`)
   * ```
   */
  readonly finishingLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.FINISHING:Finishing dictation…`)
  );

  /** Request recognition startup. Does not change state or draft. */
  readonly startRequested = output<void>();
  /** Request finalization, retaining the transcript without sending. */
  readonly confirmRequested = output<void>();
  /** Request cancellation and restoration of the consumer's saved draft. */
  readonly cancelRequested = output<void>();

  readonly active = computed(() => this.state() !== 'idle');
  readonly textSecondary = computed(
    () => this.state() === 'recording' || this.state() === 'finishing'
  );
  readonly placeholder = computed(() =>
    this.state() === 'finishing' ? this.finishingLabel() : this.listeningLabel()
  );
  readonly controls = viewChild<TemplateRef<unknown>>('controls');
  readonly focusTarget = computed(() =>
    this.active()
      ? (this.state() === 'recording' ? this.confirmButton() : this.voiceButton())?.nativeElement
      : undefined
  );
  protected readonly buttonDisabled = computed(
    () =>
      this.chatInput.disabled() ||
      (!this.active() &&
        (this.disabled() || this.chatInput.sending() || this.chatInput.interruptible()))
  );
  protected readonly buttonLabel = computed(() =>
    this.active() ? this.cancelDictationLabel() : this.startDictationLabel()
  );

  containsFocus(element: Element | null | undefined): boolean {
    return (
      !!element &&
      (element === this.voiceButton()?.nativeElement ||
        element === this.confirmButton()?.nativeElement)
    );
  }

  activate(): void {
    if (!this.chatInput.disabled() && this.state() === 'recording') {
      this.confirmRequested.emit();
    }
  }

  protected onVoiceButtonClick(): void {
    if (this.buttonDisabled()) {
      return;
    }
    if (this.active()) {
      this.cancelRequested.emit();
    } else {
      this.startRequested.emit();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.isComposing || this.chatInput.disabled()) {
      return;
    }
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      event.repeat &&
      this.containsFocus(event.target as Element)
    ) {
      event.preventDefault();
    }
    if (event.key === 'Escape' && this.active()) {
      event.preventDefault();
      event.stopPropagation();
      this.cancelRequested.emit();
    }
  }
}
