/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiNavbarVerticalItemsNextComponent } from './si-navbar-vertical-items-next.component';
import { SiNavbarVerticalNextDividerComponent } from './si-navbar-vertical-next-divider.component';
import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SiNavbarVerticalNextGroupComponent } from './si-navbar-vertical-next-group.component';
import { SiNavbarVerticalNextHeaderComponent } from './si-navbar-vertical-next-header.component';
import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SiNavbarVerticalNextComponent } from './si-navbar-vertical-next.component';

/** @experimental */
@NgModule({
  imports: [
    SiNavbarVerticalItemsNextComponent,
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextDividerComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    SiNavbarVerticalNextItemComponent
  ],
  exports: [
    SiNavbarVerticalItemsNextComponent,
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextDividerComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    SiNavbarVerticalNextItemComponent
  ]
})
export class SiNavbarVerticalNextModule {}
