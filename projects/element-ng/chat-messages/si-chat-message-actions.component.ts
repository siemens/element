/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject, input } from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  MenuItemAction,
  SiMenuActionService,
  SiMenuFactoryComponent
} from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

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
  private readonly menuActionService = inject(SiMenuActionService, { optional: true });
  protected readonly icons = addIcons({ elementOptionsVertical });

  /** Primary message actions displayed inline.
   * @defaultValue []
   */
  readonly actions = input<MenuItemAction[]>([]);

  /** Secondary actions displayed in the menu.
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItemAction[]>([]);

  /** Parameter passed to action handlers. */
  readonly actionParam = input<unknown>();

  /** More actions button aria label.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MESSAGE_ACTIONS.SECONDARY_ACTIONS:Additional actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_CHAT_MESSAGE_ACTIONS.SECONDARY_ACTIONS:Additional actions`)
  );

  protected runAction(action: MenuItemAction): void {
    if (typeof action.action === 'function') {
      action.action(this.actionParam(), action);
    } else {
      this.menuActionService?.actionTriggered(action, this.actionParam());
    }
  }
}
