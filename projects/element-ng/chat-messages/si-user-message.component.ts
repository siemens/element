/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, computed } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/menu';
import { t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { Attachment, SiAttachmentListComponent } from './si-attachment-list.component';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageActionsComponent } from './si-chat-message-actions.component';
import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * User message component for displaying the user's messages in conversational interfaces.
 *
 * The user message component renders user-submitted content in (AI) chat interfaces,
 * supporting text, attachments, and contextual actions. It appears as a text bubble
 * aligned to the right side.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component automatically handles:
 * - Styling for user messages distinct from AI or generic chat messages
 * - Displaying attachments above the message bubble
 * - Displaying primary and secondary actions
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiAiMessageComponent} for the AI message component
 * @see {@link SiAttachmentListComponent} for the base attachment component
 * @see {@link SiChatContainerComponent} for the chat container to use this within
 *
 * @experimental
 */
@Component({
  selector: 'si-user-message',
  imports: [
    SiAttachmentListComponent,
    SiChatMessageComponent,
    SiChatMessageActionDirective,
    SiChatMessageActionsComponent
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
   * t(() => $localize`:@@SI_USER_MESSAGE.SECONDARY_ACTIONS:Additional actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_USER_MESSAGE.SECONDARY_ACTIONS:Additional actions`)
  );

  protected readonly hasAttachments = computed(() => this.attachments()?.length > 0);
}
