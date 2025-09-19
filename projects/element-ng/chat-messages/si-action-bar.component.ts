/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import {
  MenuItemAction,
  SiMenuActionService,
  SiMenuFactoryComponent
} from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

export interface ActionBarItem extends MenuItemAction {
  /**
   * Optional icon that will be rendered before the label.
   * @override
   */
  icon: string;
}

@Component({
  selector: 'si-action-bar',
  imports: [SiIconComponent, SiMenuFactoryComponent, CdkMenuTrigger, SiTranslatePipe],
  templateUrl: './si-action-bar.component.html'
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
   * Secondary actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItemAction[]>([]);

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

  protected runAction(item: ActionBarItem): void {
    if (typeof item.action === 'function') {
      item.action(this.actionParam(), item);
    }

    if (typeof item.action === 'string') {
      this.menuActionService?.actionTriggered(item as MenuItemAction, this.actionParam());
    }
  }
}
