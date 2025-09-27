/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

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

  /**
   * Position of the avatar
   * @defaultValue 'start'
   */
  readonly avatarPosition = input<'start' | 'end'>('start');
}
