/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { MARKDOWN_RENDERER } from './markdown-renderer';
import { ContentBlock, MessageAction } from './message-action.model';
import { Attachment, SiAttachmentListComponent } from './si-attachment-list.component';
import { SiChatMessageBodyDirective } from './si-chat-message-body.directive';

/**
 * Unified declarative chat message component for conversational interfaces.
 *
 * This component handles message layout, content rendering, actions, attachments,
 * loading and streaming states, and optional edit mode.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component provides:
 * - Semantic message flow (`incoming`/`outgoing`)
 * - Flexible alignment (start/center/end)
 * - Variant styling hook
 * - Optional markdown rendering via DI
 * - Avatar/icon slot for message attribution
 * - Loading and streaming states
 * - Action buttons positioned on the side or bottom
 * - Attachment list rendering
 * - Optional edit mode for message updates
 * - Body projection via `siChatMessageBody`
 * - Responsive behavior that adapts to container size
 *
 * This component provides slots via content projection:
 * - `siChatMessageBody` selector: Custom body content template rendered inside the bubble
 * - `si-avatar/si-icon/img` selector: Avatar or icon representing the message sender
 * - Default content: Inline fallback content
 *
 * @see {@link SiAttachmentListComponent} for attachment list to slot in
 * @see {@link SiChatMessageBodyDirective} for custom body projection
 * @see {@link SiChatContainerComponent} for the chat container to use this within
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-message',
  imports: [
    CdkMenuTrigger,
    NgTemplateOutlet,
    SiAttachmentListComponent,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-chat-message.component.html',
  styleUrl: './si-chat-message.component.scss',
  host: {
    class: 'd-block',
    '[attr.flow]': 'flow()',
    '[attr.alignment]': 'resolvedAlignment()',
    '[attr.message-variant]': 'messageVariant() || null',
    '[attr.reveal-on-hover]': 'effectiveRevealOnHover() || null',
    '[class.has-visible-action-bar]': 'hasVisibleActionBar()',
    '[class.streaming]': 'streaming()'
  },
  hostDirectives: [SiResponsiveContainerDirective]
})
export class SiChatMessageComponent {
  private readonly markdownRenderer = inject(MARKDOWN_RENDERER);
  private readonly formattedContent = viewChild<ElementRef<HTMLDivElement>>('formattedContent');
  protected readonly bodyTemplate = contentChild(SiChatMessageBodyDirective);
  protected readonly icons = addIcons({ elementOptionsVertical });

  protected readonly editValue = signal('');

  /**
   * Message content.
   *
   * Structured content blocks are reserved for a follow-up implementation.
   * Currently only string content is rendered directly.
   * @defaultValue ''
   */
  readonly content = model<string | ContentBlock[]>('');

  /**
   * Whether to render string content through the injected markdown renderer.
   * @defaultValue false
   */
  readonly markdown = input(false);

  /**
   * Message flow semantic.
   * @defaultValue 'incoming'
   */
  readonly flow = input<'incoming' | 'outgoing'>('incoming');

  /**
   * Visual alignment override.
   *
   * If omitted, alignment is derived from `flow`.
   *
   * @defaultValue undefined
   */
  readonly alignment = input<'start' | 'center' | 'end' | undefined>(undefined);

  /**
   * Optional styling variant marker.
   *
   * @defaultValue ''
   */
  readonly messageVariant = input<string>('');

  /**
   * Primary message actions.
   * @defaultValue []
   */
  readonly actions = input<MessageAction[]>([]);

  /**
   * Secondary actions available in dropdown menu.
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input();

  /**
   * Message attachments.
   * @defaultValue []
   */
  readonly attachments = input<Attachment[]>([]);

  /**
   * Whether the message is currently loading
   * @defaultValue false
   */
  readonly loading = input(false);

  /**
   * Whether the message content is currently streaming.
   * @defaultValue false
   */
  readonly streaming = input(false);

  /**
   * Whether the message can be edited.
   * @defaultValue false
   */
  readonly editable = input(false);

  /**
   * Whether edit mode is active.
   * @defaultValue false
   */
  readonly editing = model(false);

  /**
   * Whether the message was edited.
   * @defaultValue false
   */
  readonly edited = input(false);

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MESSAGE.SECONDARY_ACTIONS:More actions`)
  );

  /**
   * Label for save edit button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE.SAVE:Save`)
   * ```
   */
  readonly saveLabel = input<TranslatableString>(t(() => $localize`:@@SI_CHAT_MESSAGE.SAVE:Save`));

  /**
   * Label for cancel edit button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE.CANCEL:Cancel`)
   * ```
   */
  readonly cancelLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MESSAGE.CANCEL:Cancel`)
  );

  /**
   * Aria label for the edit textarea.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE.EDIT_TEXTAREA:Edit message`)
   * ```
   */
  readonly editTextareaLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MESSAGE.EDIT_TEXTAREA:Edit message`)
  );

  /**
   * Label shown after a message was edited.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE.EDITED:Edited`)
   * ```
   */
  readonly editedLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MESSAGE.EDITED:Edited`)
  );

  /**
   * Where to display action buttons (if any)
   * @defaultValue 'side'
   */
  readonly actionPlacement = input<'side' | 'bottom'>('side');

  /**
   * Whether action buttons are revealed only on hover.
   *
   * When `undefined` (default), behavior is determined by `flow`:
   * - `true` for `flow="outgoing"` (user messages)
   * - `false` for `flow="incoming"` (AI/peer messages)
   *
   * When explicitly set, overrides the `flow`-based default.
   * @defaultValue undefined
   */
  readonly revealOnHover = input<boolean | undefined>(undefined);

  protected readonly effectiveRevealOnHover = computed(() => {
    const explicit = this.revealOnHover();
    if (explicit !== undefined) {
      return explicit;
    }
    // Default: reveal on hover for outgoing messages only
    return this.flow() === 'outgoing';
  });

  protected readonly hasVisibleActionBar = computed(
    () => this.hasActions() && this.actionPlacement() === 'bottom' && !this.effectiveRevealOnHover()
  );

  protected readonly resolvedAlignment = computed<'start' | 'center' | 'end'>(() => {
    const alignment = this.alignment();
    if (alignment) {
      return alignment;
    }
    return this.flow() === 'outgoing' ? 'end' : 'start';
  });

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);
  protected readonly hasActions = computed(
    () => this.actions().length > 0 || this.secondaryActions().length > 0
  );
  protected readonly hasStringContent = computed(() => {
    const content = this.content();
    return typeof content === 'string' && content.length > 0;
  });
  protected readonly textContent = computed(() => {
    const content = this.content();
    return typeof content === 'string' ? content : '';
  });
  protected readonly showFormattedContent = computed(
    () =>
      this.markdown() && this.hasStringContent() && !this.bodyTemplate() && !this.isEditingActive()
  );
  protected readonly isEditingActive = computed(
    () => this.editable() && this.editing() && this.hasStringContent()
  );

  constructor() {
    effect(() => {
      const content = this.content();

      if (typeof content === 'string') {
        this.editValue.set(content);
      }
    });

    effect(() => {
      const container = this.formattedContent()?.nativeElement;
      const content = this.content();

      if (!container || !this.markdown() || typeof content !== 'string' || this.bodyTemplate()) {
        return;
      }

      const rendered = this.markdownRenderer(content);
      container.innerHTML = '';
      container.appendChild(rendered);
    });
  }

  protected onSaveEdit(): void {
    const updatedContent = this.editValue();
    this.content.set(updatedContent);
    this.editing.set(false);
  }

  protected onEditInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) {
      this.editValue.set(target.value);
    }
  }

  protected onCancelEdit(): void {
    const content = this.content();
    if (typeof content === 'string') {
      this.editValue.set(content);
    }
    this.editing.set(false);
  }
}
