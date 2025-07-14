/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMenuBarDirective } from './si-menu-bar.directive';
import { SiMenuDividerDirective } from './si-menu-divider.directive';
import { SiMenuFactoryComponent } from './si-menu-factory.component';
import { SiMenuHeaderDirective } from './si-menu-header.directive';
import { SiMenuItemCheckboxComponent } from './si-menu-item-checkbox.component';
import { SiMenuItemRadioComponent } from './si-menu-item-radio.component';
import { SiMenuItemComponent } from './si-menu-item.component';
import { SiMenuDirective } from './si-menu.directive';

@NgModule({
  imports: [
    SiMenuBarDirective,
    SiMenuDirective,
    SiMenuDividerDirective,
    SiMenuFactoryComponent,
    SiMenuHeaderDirective,
    SiMenuItemCheckboxComponent,
    SiMenuItemComponent,
    SiMenuItemRadioComponent
  ],
  exports: [
    SiMenuBarDirective,
    SiMenuDirective,
    SiMenuDividerDirective,
    SiMenuFactoryComponent,
    SiMenuHeaderDirective,
    SiMenuItemCheckboxComponent,
    SiMenuItemComponent,
    SiMenuItemRadioComponent
  ]
})
export class SiMenuModule {}
