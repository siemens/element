/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, effect, input, viewChild, ElementRef, computed, signal } from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { Attachment, SiAttachmentListComponent } from './si-attachment-list.component';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * User message component for displaying the user's messages in conversational interfaces.
 *
 * The user message component renders user-submitted content in (AI) chat interfaces,
 * supporting text, attachments, and contextual actions. It appears as a text bubble
 * aligned to the right side and supports markdown formatting for rich content.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component automatically handles:
 * - Styling for user messages distinct from AI or generic chat messages
 * - Option to render markdown content, provide via `contentFormatter` input with a markdown renderer function (e.g., from {@link getMarkdownRenderer})
 * - Displaying attachments above the message bubble
 * - Displaying primary and secondary actions
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiAiMessageComponent} for the AI message component
 * @see {@link SiAttachmentListComponent} for the base attachment component
 * @see {@link getMarkdownRenderer} for markdown formatting support
 * @see {@link SiChatContainerComponent} for the chat container to use this within
 *
 * @experimental
 */
@Component({
  selector: 'si-user-message',
  imports: [
    CdkMenuTrigger,
    SiAttachmentListComponent,
    SiChatMessageComponent,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiChatMessageActionDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-user-message.component.html',
  styleUrl: './si-user-message.component.scss'
})
export class SiUserMessageComponent {
  protected readonly formattedContent = viewChild<ElementRef<HTMLDivElement>>('formattedContent');
  protected readonly icons = addIcons({ elementOptionsVertical });

  /**
   * The user message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Optional formatter function to transform content before display.
   * - Returns string: Content will be inserted as text with built-in sanitization
   * - Returns Node: DOM node will be inserted directly without sanitization
   *
   * **Note:** When returning a Node with formatted content, apply the `markdown-content` class
   * to the root element to ensure proper styling (e.g., `div.className = 'markdown-content'`).
   * The function returned by {@link getMarkdownRenderer} does this automatically.
   *
   * **Warning:** When returning a Node, ensure the content is safe to prevent XSS attacks
   * @defaultValue undefined
   */
  readonly contentFormatter = input<((text: string) => string | Node) | undefined>(undefined);

  /**
   * Primary message actions (edit, delete, copy, etc.).
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<MessageAction[]>([]);

  /**
   * Secondary actions available in dropdown menu, first use primary actions and only add secondary actions additionally
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /**
   * List of attachments included with this message
   * @defaultValue []
   */
  readonly attachments = input<Attachment[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input<any>();

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_USER_MESSAGE.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_USER_MESSAGE.SECONDARY_ACTIONS:More actions`)
  );

  protected readonly hasAttachments = computed(() => this.attachments()?.length > 0);

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
}
