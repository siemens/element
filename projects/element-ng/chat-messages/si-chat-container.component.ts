/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, ElementRef, input, viewChild } from '@angular/core';

/**
 * A declarative container component for displaying a chat interface with automatic scroll-to-bottom behavior.
 *
 * This component provides the layout and styling for a chat interface, managing scrolling behavior
 * to keep the newest messages visible while respecting user scrolling actions. It automatically
 * scrolls to the bottom when new content is added, unless the user has scrolled up to view older messages.
 *
 * Use via content projection:
 * - Default content: Chat messages displayed in the scrollable messages container or a welcome screen (empty state).
 * - `si-inline-notification` selector: Notification component displayed above the input area
 * - `si-chat-input` or `[siChatContainerInput]` selector: Input controls for composing messages
 *
 * @see {@link SiChatInputComponent} for the chat input wrapper component
 * @see {@link SiChatContainerInputDirective} for other input controls to slot in
 * @see {@link SiAiMessageComponent} for AI messages to slot in
 * @see {@link SiUserMessageComponent} for user messages (in AI chats) to slot in
 * @see {@link SiChatMessageComponent} for the chat message wrapper component to slot in other messages
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-container',
  templateUrl: './si-chat-container.component.html',
  styleUrl: './si-chat-container.component.scss',
  host: {
    class: 'd-flex si-layout-inner flex-grow-1 flex-column h-100 w-100',
    '[class]': 'colorVariant()'
  }
})
export class SiChatContainerComponent {
  private readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  /**
   * The color variant to apply to the container.
   * @defaultValue 'base-0'
   */
  readonly colorVariant = input<string>('base-0');

  /**
   * Disables automatic scrolling to the bottom when new content is added.
   * @defaultValue false
   */
  readonly noAutoScroll = input(false, { transform: booleanAttribute });

  /**
   * Scrolls to the bottom of the messages container immediately.
   * This method forces a scroll even if the user has scrolled up.
   */
  public scrollToBottom(): void {
    if (this.noAutoScroll()) {
      return;
    }

    const container = this.messagesContainer();
    if (!container) {
      return;
    }

    const element = container.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  /**
   * Scrolls to the top of the messages container immediately.
   */
  public scrollToTop(): void {
    const container = this.messagesContainer();
    if (!container) {
      return;
    }

    const element = container.nativeElement;
    element.scrollTop = 0;
  }

  /**
   * Focuses the messages container element.
   */
  public focus(): void {
    const container = this.messagesContainer();
    container?.nativeElement.focus();
  }
}
