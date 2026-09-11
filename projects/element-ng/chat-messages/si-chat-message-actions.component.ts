/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, input } from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';

/**
 * Shared action controls for user and AI messages.
 *
 * Pass the pre-split primary and secondary actions to this component.
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-message-actions',
  imports: [
    CdkMenuTrigger,
    SiChatMessageActionDirective,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-chat-message-actions.component.html',
  host: {
    class: 'd-block'
  }
})
export class SiChatMessageActionsComponent {
  protected readonly icons = addIcons({ elementOptionsVertical });

  /** Primary message actions displayed inline.
   * @defaultValue []
   */
  readonly actions = input<MessageAction[]>([]);

  /** Secondary actions displayed in the menu.
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /** Parameter passed to action handlers. */
  readonly actionParam = input<unknown>();

  /** More actions button aria label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE_ACTIONS.SECONDARY_ACTIONS:Additional actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MESSAGE_ACTIONS.SECONDARY_ACTIONS:Additional actions`)
  );
}
