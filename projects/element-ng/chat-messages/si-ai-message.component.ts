/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { ActionBarItem, SiActionBarComponent } from './si-action-bar.component';
import { SiChatMessageComponent } from './si-chat-message.component';
import { SiMarkdownContentComponent } from './si-markdown-content.component';

@Component({
  selector: 'si-ai-message',
  imports: [
    SiChatMessageComponent,
    SiIconComponent,
    SiMarkdownContentComponent,
    SiTranslatePipe,
    SiActionBarComponent
  ],
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
   * Custom AI icon name
   * @defaultValue 'element-ai'
   */
  readonly aiIcon = input('element-ai');

  /**
   * Primary actions available for this message (thumbs up/down, copy, retry, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<ActionBarItem[]>([]);

  /**
   * Secondary actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItemAction[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input();

  /**
   * Unique identifier for this message
   */
  readonly messageId = input<string>();

  /**
   * Alt text for AI icon
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.AI_ASSISTANT:AI Assistant`)
   * ```
   */
  readonly aiIconAltText = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_MESSAGE.AI_ASSISTANT:AI Assistant`)
  );

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
