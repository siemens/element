/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiMenuActionService } from './si-menu-action.service';
import { SiMenuFactoryComponent } from './si-menu-factory.component';
import { MenuItem, MenuItemAction } from './si-menu-model';

/**
 * Action bar item used in {@link SiActionBarComponent}, representing an action with icon, label (for accessibility), and handler.
 * Only the icon will be displayed.
 * @experimental
 */
export interface ActionBarItem {
  /** ID that will be attached to the DOM node. */
  id?: string;
  /** Label that is shown to the user. */
  label: TranslatableString;
  /**
   * Icon used to represent the action
   */
  icon: string;
  /**
   * Action that is called when the item is triggered.
   * A function will be called, a string will be dispatched to the {@link SiMenuActionService}.
   */
  action: ((actionParam: any, source: this) => void) | string;
  /** Whether the menu item is disabled. */
  disabled?: boolean;
}

/**
 * Action bar component to show primary actions inline as ghost buttons and secondary actions in a dropdown menu.
 * Purposefully restrictive for use within other components, e.g., chat messages.
 * @experimental
 */
@Component({
  selector: 'si-action-bar',
  imports: [SiIconComponent, SiMenuFactoryComponent, CdkMenuTrigger, SiTranslatePipe],
  templateUrl: './si-action-bar.component.html',
  host: {
    class: 'd-flex gap-4'
  }
})
export class SiActionBarComponent {
  private menuActionService = inject(SiMenuActionService, { optional: true });

  /**
   * Primary actions available for this message (thumbs up/down, copy, retry, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<ActionBarItem[]>([]);

  /**
   * Actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input<any>();

  /**
   * Secondary actions dropdown button aria label.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
  );

  protected runAction(item: ActionBarItem): void {
    if (typeof item.action === 'function') {
      item.action(this.actionParam(), item);
    }

    if (typeof item.action === 'string') {
      this.menuActionService?.actionTriggered(
        { type: 'action', ...item } as MenuItemAction,
        this.actionParam()
      );
    }
  }
}
