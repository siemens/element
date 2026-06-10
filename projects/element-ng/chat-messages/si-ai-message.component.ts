/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  booleanAttribute,
  Component,
  computed,
  effect,
  input,
  output,
  viewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { SiChatAnnotatedText, SiChatCitation } from './si-annotated-text.model';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageComponent } from './si-chat-message.component';
import { SiCitationButtonComponent } from './si-citation-button.component';
import { SiCitationPillComponent } from './si-citation-pill.component';

/**
 * AI message component for displaying AI-generated responses in conversational interfaces.
 *
 * The AI message component renders AI-generated content in chat interfaces,
 * supporting text formatting, markdown, loading states, and contextual actions.
 * It appears as text (no bubble) aligned to the left side without any avatar/icon slot.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component automatically handles:
 * - Styling for AI messages distinct from user or generic chat messages
 * - Option to render markdown content, provide via `contentFormatter` input with a markdown renderer function (e.g., from {@link getMarkdownRenderer})
 * - Showing loading states with skeleton UI during generation
 * - Displaying primary and secondary actions
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiUserMessageComponent} for the user message component
 * @see {@link getMarkdownRenderer} for markdown formatting support
 * @see {@link SiChatContainerComponent} for the chat container to use this within
 *
 * @experimental
 */
@Component({
  selector: 'si-ai-message',
  imports: [
    CdkMenuTrigger,
    SiChatMessageComponent,
    SiCitationButtonComponent,
    SiCitationPillComponent,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiChatMessageActionDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-ai-message.component.html',
  styleUrl: './si-ai-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiAiMessageComponent {
  protected readonly formattedContent = viewChild<ElementRef<HTMLDivElement>>('formattedContent');
  protected readonly icons = addIcons({ elementOptionsVertical });

  /**
   * Pre-segmented annotated text containing inline citation references.
   * When provided, takes precedence over the `content` input.
   * Use `parseCitationMarkers` or `parseCitationOffsets` to produce this value.
   * @defaultValue undefined
   */
  readonly annotatedText = input<SiChatAnnotatedText | undefined>(undefined);

  /**
   * When `true`, replaces the inline citation pills with a single circular globe
   * button in the action bar that opens a popover listing all citations.
   * Has no effect when {@link SiAiMessageComponent#annotatedText} is not provided
   * or contains no citations.
   * @defaultValue false
   */
  readonly showSourceCitationButton = input(false, { transform: booleanAttribute });

  /**
   * Emitted when a citation pill inside the message is clicked, or when a citation
   * inside the source citation button popover is activated.
   * The emitted value is the {@link SiChatCitation} that was clicked.
   */
  readonly citationClicked = output<SiChatCitation>();

  protected readonly allCitations = computed(() => this.annotatedText()?.citations ?? []);

  protected getCitation(id: string): SiChatCitation {
    return (
      this.annotatedText()?.citations.find(c => c.id === id) ?? {
        id,
        title: id
      }
    );
  }

  /**
   * The AI-generated message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Optional formatter function to transform content before display.
   * - Returns string: Content will be sanitized using Angular's DomSanitizer
   * - Returns Node: DOM node will be inserted directly without sanitization
   *
   * **Note:** If using a markdown renderer, make sure to apply the `markdown-content` class
   * to the root element to ensure proper styling using the Element theme (e.g., `div.className = 'markdown-content'`).
   * The function returned by {@link getMarkdownRenderer} does this automatically.
   *
   * **Warning:** When returning a Node, ensure the content is safe to prevent XSS attacks
   * @defaultValue undefined
   */
  readonly contentFormatter = input<((text: string) => string | Node) | undefined>(undefined);

  protected readonly textContent = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const formatter = this.contentFormatter();
      const contentValue = this.content();
      const container = this.formattedContent()?.nativeElement;

      if (container && contentValue) {
        if (formatter) {
          const formatted = formatter(contentValue);

          if (typeof formatted === 'string') {
            this.textContent.set(formatted);
          } else if (formatted instanceof Node) {
            this.textContent.set(undefined);
            container.innerHTML = '';
            container.appendChild(formatted);
          }
        } else {
          this.textContent.set(contentValue);
        }
      }
    });
  }

  /**
   * Whether the message is currently being generated (shows skeleton)
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Primary actions available for this message (thumbs up/down, copy, retry, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<MessageAction[]>([]);

  /**
   * Secondary actions available in dropdown menu, first use primary actions and only add secondary actions additionally
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input();

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_AI_MESSAGE.SECONDARY_ACTIONS:More actions`)
  );
}
