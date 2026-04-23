/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import {
  SiNavbarVerticalNextItemsComponent,
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextFooterItemsComponent,
  SiNavbarVerticalNextGroupComponent,
  SiNavbarVerticalNextGroupTriggerDirective,
  SiNavbarVerticalNextHeaderComponent,
  SiNavbarVerticalNextItemComponent
} from '@siemens/element-ng/navbar-vertical-next';

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    SiHeaderActionsDirective,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderBrandDirective,
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextFooterItemsComponent,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    RouterLink,
    RouterLinkActive,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-navbar-vertical-next-text.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
