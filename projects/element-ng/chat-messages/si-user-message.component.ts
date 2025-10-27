/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, effect, input, viewChild, ElementRef, computed, signal } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { Attachment, SiAttachmentListComponent } from './si-attachment-list.component';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * User message component for displaying user input in conversational interfaces.
 *
 * The user message component renders user-submitted content in chat interfaces,
 * supporting text, attachments, and contextual actions. It appears as a text bubble
 * aligned to the right side and supports markdown formatting for rich content.
 *
 * @remarks
 * This component is designed for use in:
 * - AI chat interfaces where user input needs to be displayed
 * - Peer-to-peer conversation interfaces
 * - Conversation histories or chat transcripts
 *
 * The component automatically handles:
 * - Rendering markdown content with syntax highlighting
 * - Displaying attachments above the message bubble
 * - Showing primary and secondary actions on hover (desktop) or tap (mobile)
 * - Proper alignment and styling for user messages
 *
 * @example
 * Basic usage with content only:
 * ```html
 * <si-user-message [content]="'Hello, how can I help you?'" />
 * ```
 *
 * @example
 * With actions and attachments:
 * ```typescript
 * import { Component } from '@angular/core';
 * import { SiUserMessageComponent } from '@siemens/element-ng/chat-messages';
 *
 * @Component({
 *   selector: 'app-chat',
 *   imports: [SiUserMessageComponent],
 *   template: `
 *     <si-user-message
 *       [content]="message.text"
 *       [actions]="messageActions"
 *       [secondaryActions]="menuActions"
 *       [attachments]="message.attachments"
 *       [actionParam]="message"
 *     />
 *   `
 * })
 * export class ChatComponent {
 *   messageActions = [
 *     { icon: 'copy', label: 'Copy', action: (id) => this.copyMessage(id) },
 *     { icon: 'edit', label: 'Edit', action: (id) => this.editMessage(id) }
 *   ];
 *
 *   menuActions = [
 *     { label: 'Delete', action: (id) => this.deleteMessage(id) }
 *   ];
 * }
 * ```
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiAttachmentListComponent} for attachment handling
 * @see {@link SiMarkdownRendererComponent} for markdown rendering
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

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);

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
