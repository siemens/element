/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { t } from '@siemens/element-translate-ng/translate';

import { ActionBarItem, SiActionBarComponent } from './si-action-bar.component';
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
   * Primary actions available for this message (edit, delete, copy, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<ActionBarItem[]>([]);

  /**
   * Secondary actions available in dropdown menu, first use primary actions and only add secondary actions additionally
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItemAction[]>([]);

  /**
   * List of attachments included with this message
   * @defaultValue []
   */
  readonly attachments = input<AttachmentItem[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input<any>();

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
  );

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);
}
