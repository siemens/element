/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  PLATFORM_ID,
  viewChild,
  inject
} from '@angular/core';

/**
 * A declarative container component for displaying a chat interface with automatic scroll-to-bottom behavior.
 *
 * This component provides the layout and styling for a chat interface, managing scrolling behavior
 * to keep the newest messages visible while respecting user scrolling actions. It automatically
 * scrolls to the bottom when new content is added, unless the user has scrolled up to view older messages.
 *
 * Use via content projection:
 *
 * - Default content: Chat messages displayed in the scrollable messages container or something like an empty state.
 * - `si-inline-notification` selector: Notification component displayed above the input area
 * - `si-chat-input` or `[siChatContainerInput]` selector: Input controls for composing messages
 *
 * @see {@link SiChatInputComponent} for the chat input component
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
export class SiChatContainerComponent implements AfterContentInit, OnDestroy {
  private readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');
  private readonly platformId = inject(PLATFORM_ID);

  private isUserAtBottom = true;
  private scrollTimeout: ReturnType<typeof setTimeout> | undefined;
  private lastScrollTime = 0;
  private pendingScroll = false;
  private scrollDebounceMs = 7; // ~144fps
  private resizeObserver: ResizeObserver | undefined;
  private contentObserver: MutationObserver | undefined;

  /**
   * The color variant to apply to the container.
   * @defaultValue 'base-0'
   */
  readonly colorVariant = input<string>('base-0');

  /**
   * Disables automatic scrolling to the bottom when new content is added.
   * @defaultValue false
   */
  readonly noAutoScroll = input(false, {
    transform: (value: boolean | string) => value === '' || value === true
  });

  constructor() {
    effect(() => {
      if (this.messagesContainer()) {
        this.setupResizeObserver();
        this.setupContentObserver();
      }
    });
  }

  ngAfterContentInit(): void {
    this.scrollToBottomDuringStreaming();
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }
  }

  private scrollToBottomDuringStreaming(): void {
    if (this.noAutoScroll() || !this.isUserAtBottom) {
      return;
    }

    const container = this.messagesContainer();
    if (!container) {
      return;
    }

    const element = container.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  private debouncedScrollToBottom(): void {
    const now = Date.now();
    const timeSinceLastScroll = now - this.lastScrollTime;

    if (timeSinceLastScroll >= this.scrollDebounceMs) {
      this.lastScrollTime = now;
      this.scrollToBottomDuringStreaming();
      this.pendingScroll = false;
    } else {
      this.pendingScroll = true;
    }

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      if (this.pendingScroll) {
        this.lastScrollTime = Date.now();
        this.scrollToBottomDuringStreaming();
        this.pendingScroll = false;
      }
    }, this.scrollDebounceMs);
  }

  private setupResizeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const container = this.messagesContainer();
    if (!container || this.resizeObserver) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.debouncedScrollToBottom();
    });

    this.resizeObserver.observe(container.nativeElement);
  }

  private setupContentObserver(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const container = this.messagesContainer();
    if (!container || this.contentObserver) {
      return;
    }

    this.contentObserver = new MutationObserver(() => {
      this.debouncedScrollToBottom();
    });

    this.contentObserver.observe(container.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private checkIfUserAtBottom(): void {
    const container = this.messagesContainer();
    if (!container) {
      return;
    }

    const element = container.nativeElement;
    const threshold = 100;
    this.isUserAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
  }

  protected onScroll(): void {
    this.checkIfUserAtBottom();
  }

  /**
   * Scrolls to the bottom of the messages container immediately.
   * This method forces a scroll even if the user has scrolled up.
   */
  public scrollToBottom(): void {
    this.isUserAtBottom = true;
    this.scrollToBottomDuringStreaming();
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
    this.isUserAtBottom = false;
  }

  /**
   * Focuses the messages container element.
   */
  public focus(): void {
    const container = this.messagesContainer();
    container?.nativeElement.focus();
  }
}
