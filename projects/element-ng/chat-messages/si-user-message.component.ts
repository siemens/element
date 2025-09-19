/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiActionBarComponent } from './si-action-bar.component';
import { SiAttachmentListComponent, type AttachmentItem } from './si-attachment-list.component';
import { SiChatMessageComponent } from './si-chat-message.component';
import { SiMarkdownContentComponent } from './si-markdown-content.component';

@Component({
  selector: 'si-user-message',
  imports: [
    SiMarkdownContentComponent,
    SiAttachmentListComponent,
    SiChatMessageComponent,
    SiActionBarComponent
  ],
  templateUrl: './si-user-message.component.html',
  styleUrl: './si-user-message.component.scss'
})
export class SiUserMessageComponent {
  /**
   * The user message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Actions available for this message (edit, delete, copy, etc.)
   * Actions are revealed on hover for desktop users, always visible on mobile
   * @defaultValue []
   */
  readonly actions = input<MenuItemAction[]>([]);

  /**
   * List of attachments included with this message
   * @defaultValue []
   */
  readonly attachments = input<AttachmentItem[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input<any>();

  /**
   * Unique identifier for this message
   */
  readonly messageId = input<string>();

  /**
   * Aria label for message actions button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_USER_MESSAGE.MESSAGE_ACTIONS:Message actions`)
   * ```
   */
  readonly actionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_USER_MESSAGE.MESSAGE_ACTIONS:Message actions`)
  );

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);
}
