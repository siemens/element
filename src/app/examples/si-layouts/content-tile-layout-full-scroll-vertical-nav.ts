/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective,
  SiLaunchpadFactoryComponent
} from '@siemens/element-ng/application-header';
import { SiCardComponent } from '@siemens/element-ng/card';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import {
  SidePanelMode,
  SidePanelSize,
  SiSidePanelComponent,
  SiSidePanelContentComponent
} from '@siemens/element-ng/side-panel';
import { SiStatusBarComponent, StatusBarItem } from '@siemens/element-ng/status-bar';
import { SiSystemBannerComponent } from '@siemens/element-ng/system-banner';
import { LOG_EVENT } from '@siemens/live-preview';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [
    SiNavbarVerticalComponent,
    SiCardComponent,
    SiAccordionComponent,
    SiStatusBarComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiCollapsiblePanelComponent,
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiLaunchpadFactoryComponent,
    SiSystemBannerComponent,
    AsyncPipe,
    SiHeaderLogoDirective
  ],
  templateUrl: './content-tile-layout-full-scroll-vertical-nav.html'
})
export class SampleComponent {
  collapsed = true;
  mode: SidePanelMode = 'scroll';
  size: SidePanelSize = 'regular';
  protected hideSystembanner = of(true).pipe(delay(navigator.webdriver ? 15000 : 5000));

  logEvent = inject(LOG_EVENT);

  menuItems: NavbarVerticalItem[] = [
    {
      type: 'group',
      label: 'Home',
      icon: 'element-home',
      children: [
        {
          type: 'router-link',
          label: 'Sub Item',
          routerLink: 'subItem',
          badge: 4,
          badgeColor: 'warning'
        },
        { type: 'router-link', label: 'Sub Item 2', routerLink: 'subItem2' },
        { type: 'router-link', label: 'Sub Item 3', routerLink: 'subItem3' }
      ]
    },
    {
      type: 'group',
      label: 'Documentation',
      icon: 'element-document',
      children: [
        { type: 'router-link', label: 'Sub Item 4', routerLink: 'subItem4' },
        { type: 'router-link', label: 'Sub Item 5', routerLink: 'subItem5' },
        { type: 'router-link', label: 'Sub Item 6', routerLink: 'subItem6' }
      ]
    },
    {
      type: 'router-link',
      label: 'Energy & Operations',
      icon: 'element-trend',
      routerLink: 'energy'
    },
    {
      type: 'router-link',
      label: 'Test Coverage',
      icon: 'element-diagnostic',
      routerLink: 'coverage'
    }
  ];

  statusItems: StatusBarItem[] = [
    { title: 'Emergency', status: 'danger', value: 4, action: item => this.logEvent(item) },
    { title: 'Life safety', status: 'danger', value: 0, action: item => this.logEvent(item) },
    { title: 'Security', status: 'danger', value: 0 },
    { title: 'Supervisory', status: 'danger', value: 0 },
    { title: 'Trouble', status: 'warning', value: 42, action: item => this.logEvent(item) },
    { title: 'Success', status: 'success', value: 200, action: item => this.logEvent(item) }
  ];

  shouldBlink = !navigator.webdriver;

  counter(i: number): undefined[] {
    return new Array(i);
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  toggleMode(): void {
    this.mode = this.mode === 'over' ? 'scroll' : 'over';
  }

  changeSize(): void {
    this.size = this.size === 'regular' ? 'wide' : 'regular';
  }
}
