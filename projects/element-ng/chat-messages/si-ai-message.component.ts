/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input } from '@angular/core';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { t } from '@siemens/element-translate-ng/translate';

import { ActionBarItem, SiActionBarComponent } from './si-action-bar.component';
import { SiChatMessageComponent } from './si-chat-message.component';
import { SiMarkdownContentComponent } from './si-markdown-content.component';

@Component({
  selector: 'si-ai-message',
  imports: [SiChatMessageComponent, SiMarkdownContentComponent, SiActionBarComponent],
  templateUrl: './si-ai-message.component.html',
  styleUrl: './si-ai-message.component.scss',
  host: {
    class: 'si-ai-message'
  }
})
export class SiAiMessageComponent {
  /**
   * The AI-generated message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Whether the message is currently being generated (shows skeleton)
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Primary actions available for this message (thumbs up/down, copy, retry, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<ActionBarItem[]>([]);

  /**
   * Secondary actions available in dropdown menu, first use primary actions and only add secondary actions additionally
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItemAction[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input();

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
}
