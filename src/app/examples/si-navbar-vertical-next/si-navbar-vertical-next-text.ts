/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  NavbarVerticalNextItem,
  SiNavbarVerticalNextComponent
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
    RouterLink,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-navbar-vertical-next-text.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  menuItems: NavbarVerticalNextItem[] = [
    {
      type: 'group',
      label: 'Home',
      children: [
        { type: 'router-link', label: 'Sub Item', routerLink: 'subItem' },
        { type: 'router-link', label: 'Sub Item 2', routerLink: 'subItem2' },
        { type: 'router-link', label: 'Sub Item 3', routerLink: 'subItem3' }
      ]
    },
    {
      type: 'group',
      label: 'Documentation',
      children: [
        { type: 'router-link', label: 'Sub Item 4', routerLink: 'subItem4' },
        { type: 'router-link', label: 'Sub Item 5', routerLink: 'subItem5' },
        { type: 'router-link', label: 'Sub Item 6', routerLink: 'subItem6' }
      ]
    },
    { type: 'header', label: 'All the rest' },
    { type: 'router-link', label: 'Energy & Operations', routerLink: 'energy' },
    { type: 'router-link', label: 'Test Coverage', routerLink: 'coverage' }
  ];
}
