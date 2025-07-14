/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuGroup, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { SiLinkActionService, SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiMenuActionService } from './si-menu-action.service';
import { SiMenuDividerDirective } from './si-menu-divider.directive';
import { SiMenuFactoryItemGuardDirective } from './si-menu-factory-item-guard.directive';
import { SiMenuHeaderDirective } from './si-menu-header.directive';
import { SiMenuItemCheckboxComponent } from './si-menu-item-checkbox.component';
import { SiMenuItemRadioComponent } from './si-menu-item-radio.component';
import { SiMenuItemComponent } from './si-menu-item.component';
import { MenuItemAction, MenuItemCheckbox, MenuItem, MenuItemRadio } from './si-menu-model';
import { SiMenuDirective } from './si-menu.directive';

@Component({
  selector: 'si-menu-factory',
  imports: [
    SiMenuDirective,
    SiMenuItemComponent,
    SiMenuItemRadioComponent,
    SiMenuItemCheckboxComponent,
    SiMenuHeaderDirective,
    SiMenuDividerDirective,
    SiLinkModule,
    CdkMenuTrigger,
    SiTranslateModule,
    CdkMenuGroup,
    NgTemplateOutlet,
    RouterLink,
    SiMenuFactoryItemGuardDirective
  ],
  templateUrl: './si-menu-factory.component.html'
})
export class SiMenuFactoryComponent {
  readonly items = input<readonly (MenuItemLegacy | MenuItem)[]>();
  readonly actionParam = input();

  private linkActionService = inject(SiLinkActionService, { optional: true });
  private menuActionService = inject(SiMenuActionService, { optional: true });

  protected isNewItemStyle(item: MenuItemLegacy | MenuItem): item is MenuItem {
    return 'label' in item || item.type === 'divider' || item.type === 'radio-group';
  }

  protected isLegacyItemStyle(item: MenuItemLegacy | MenuItem): item is MenuItemLegacy {
    return !this.isNewItemStyle(item);
  }

  protected radioOrCheckboxTriggered(item: MenuItemLegacy): void {
    if (typeof item.action === 'function') {
      item.action(this.actionParam());
    } else {
      this.linkActionService?.emit(item, this.actionParam());
    }
  }

  protected runAction(item: MenuItemAction | MenuItemRadio | MenuItemCheckbox): void {
    if (typeof item.action === 'function') {
      item.action(this.actionParam(), item as any); // typescript cannot level down the item type properly
    }

    if (typeof item.action === 'string') {
      this.menuActionService?.actionTriggered(item, this.actionParam());
    }
  }
}
