/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

/**
 * Base declarative chat message component that provides the layout structure for chat messages.
 *
 * This component handles the core message layout including avatar positioning, loading states,
 * and action button as well as attachment list placement. It serves as the foundation for more specialized message components
 * like {@link SiUserMessageComponent} and {@link SiAiMessageComponent}.
 *
 * The component provides:
 * - Flexible alignment (start/end) for different message types
 * - Avatar/icon slot for message attribution
 * - Loading state with skeleton UI
 * - Action buttons positioned on the side or bottom
 * - Attachment list display slot
 * - Responsive behavior that adapts to container size
 *
 * This is a low-level component designed for slotting in custom content, it provides slots via content projection:
 * - Default content: Main message content area (consider using {@link SiMarkdownRendererComponent} for markdown support)
 * - `si-avatar/si-icon/img` selector: Avatar or icon representing the message sender
 * - `si-chat-message-action` selector: Action buttons related to the message
 * - `si-attachment-list` selector: Attachment list component for displaying file attachments
 *
 * @see {@link SiUserMessageComponent} for user message display
 * @see {@link SiAiMessageComponent} for AI message display
 * @see {@link SiAttachmentListComponent} for attachment list to slot in
 * @see {@link SiChatMessageActionDirective} for action buttons to slot in
 * @see {@link SiMarkdownRendererComponent} for markdown content rendering
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-message',
  templateUrl: './si-chat-message.component.html',
  styleUrl: './si-chat-message.component.scss',
  host: {
    class: 'd-block'
  },
  hostDirectives: [SiResponsiveContainerDirective]
})
export class SiChatMessageComponent {
  /**
   * Whether the message is currently loading
   * @defaultValue false
   */
  readonly loading = input(false);

  /**
   * Alignment of the message
   * @defaultValue 'start'
   */
  readonly alignment = input<'start' | 'end'>('start');

  /**
   * Where to display action buttons (if any)
   * @defaultValue 'side'
   */
  readonly actionsPosition = input<'side' | 'bottom'>('side');
}
