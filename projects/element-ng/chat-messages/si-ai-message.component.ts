/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  booleanAttribute,
  Component,
  effect,
  input,
  viewChild,
  ElementRef,
  signal
} from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * AI message component for displaying AI-generated responses in conversational interfaces.
 *
 * The AI message component renders AI-generated content in chat interfaces,
 * supporting text formatting, markdown, loading states, and contextual actions.
 * It appears as text (no bubble) aligned to the left side without any avatar/icon slot.
 *
 * @remarks
 * This component is designed for use in:
 * - AI chat interfaces where model responses need to be displayed
 * - Chatbot implementations
 * - Conversational AI applications
 * - AI assistant interfaces
 *
 * The component automatically handles:
 * - Rendering markdown content with syntax highlighting
 * - Showing loading states with skeleton UI during generation
 * - Displaying primary and secondary actions on hover (desktop) or tap (mobile)
 * - Proper alignment and styling for AI messages
 * - Content sanitization for security
 *
 * @example
 * Basic usage with content only:
 * ```html
 * <si-ai-message [content]="'I can help you with that.'" />
 * ```
 *
 * @example
 * With loading state and actions:
 * ```typescript
 * import { Component } from '@angular/core';
 * import { SiAiMessageComponent } from '@siemens/element-ng/chat-messages';
 *
 * @Component({
 *   selector: 'app-chat',
 *   imports: [SiAiMessageComponent],
 *   template: `
 *     <si-ai-message
 *       [content]="message.text"
 *       [loading]="message.isGenerating"
 *       [actions]="messageActions"
 *       [secondaryActions]="menuActions"
 *       [actionParam]="message"
 *     />
 *   `
 * })
 * export class ChatComponent {
 *   messageActions = [
 *     { icon: 'thumbs-up', label: 'Good response', action: (id) => this.ratePositive(id) },
 *     { icon: 'thumbs-down', label: 'Bad response', action: (id) => this.rateNegative(id) },
 *     { icon: 'copy', label: 'Copy', action: (id) => this.copyMessage(id) }
 *   ];
 *
 *   menuActions = [
 *     { label: 'Regenerate', action: (id) => this.regenerate(id) },
 *     { label: 'Report', action: (id) => this.reportMessage(id) }
 *   ];
 * }
 * ```
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiUserMessageComponent} for the companion user message component
 * @see {@link getMarkdownRenderer} for markdown formatting support
 *
 * @experimental
 */
@Component({
  selector: 'si-ai-message',
  imports: [
    CdkMenuTrigger,
    SiChatMessageComponent,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiChatMessageActionDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-ai-message.component.html',
  styleUrl: './si-ai-message.component.scss',
  host: {
    class: 'si-ai-message'
  }
})
export class SiAiMessageComponent {
  protected readonly formattedContent = viewChild<ElementRef<HTMLDivElement>>('formattedContent');

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
