/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiNavbarVerticalNextDividerComponent } from './si-navbar-vertical-next-divider.component';
import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SiNavbarVerticalNextGroupComponent } from './si-navbar-vertical-next-group.component';
import { SiNavbarVerticalNextHeaderComponent } from './si-navbar-vertical-next-header.component';
import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SiNavbarVerticalNextItemsComponent } from './si-navbar-vertical-next-items.component';
import { SiNavbarVerticalNextSearchComponent } from './si-navbar-vertical-next-search.component';
import { SiNavbarVerticalNextComponent } from './si-navbar-vertical-next.component';

/** @experimental */
@NgModule({
  imports: [
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextDividerComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextSearchComponent
  ],
  exports: [
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextDividerComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextSearchComponent
  ]
})
export class SiNavbarVerticalNextModule {}
