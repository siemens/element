/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

/**
 * Base chat message component that provides the layout structure for conversational interfaces.
 *
 * This component handles the core message layout including avatar positioning, loading states,
 * and action button placement. It serves as the foundation for more specialized message components
 * like {@link SiUserMessageComponent} and {@link SiAiMessageComponent}.
 *
 * @remarks
 * The component provides:
 * - Flexible alignment (start/end) for different message types
 * - Avatar/icon slot for message attribution
 * - Loading state with skeleton UI
 * - Action buttons positioned on the side or bottom
 * - Responsive behavior that adapts to container size
 * - Attachment display slot
 *
 * This is a low-level component typically not used directly. Instead, use the higher-level
 * message components that wrap this component with specific styling and behavior.
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
