/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Component, inject, OnDestroy, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiAccordionComponent,
  SiCollapsiblePanelComponent
} from '@spike-rabbit/element-ng/accordion';
import {
  App,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective,
  SiLaunchpadFactoryComponent
} from '@spike-rabbit/element-ng/application-header';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { SiCircleStatusModule } from '@spike-rabbit/element-ng/circle-status';
import { SiElectrontitlebarComponent } from '@spike-rabbit/element-ng/electron-titlebar';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@spike-rabbit/element-ng/header-dropdown';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import {
  NavbarVerticalItem,
  SiNavbarVerticalComponent
} from '@spike-rabbit/element-ng/navbar-vertical';
import {
  SiSidePanelComponent,
  SiSidePanelContentComponent,
  SiSidePanelService
} from '@spike-rabbit/element-ng/side-panel';
import { SiStatusBarModule, StatusBarItem } from '@spike-rabbit/element-ng/status-bar';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiStatusBarModule,
    SiCardComponent,
    SiNavbarVerticalComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiCircleStatusModule,
    SiAccordionComponent,
    SiCollapsiblePanelComponent,
    SiElectrontitlebarComponent,
    PortalModule,
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiLaunchpadFactoryComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-fixed-height-layout-side-panel.html'
})
export class SampleComponent implements OnDestroy {
  // the real function is injected by the previewer
  logEvent = inject(LOG_EVENT);

  titlebarItems: MenuItem[] = [
    {
      type: 'action',
      label: 'Zoom in',
      icon: 'element-zoom-in',
      action: () => this.logEvent('zoom in')
    },
    {
      type: 'action',
      label: 'Zoom out',
      icon: 'element-zoom-out',
      action: () => this.logEvent('zoom out')
    },
    {
      type: 'action',
      label: 'Reset Zoom',
      icon: 'element-empty',
      action: () => this.logEvent('reset zoom')
    },
    {
      type: 'divider'
    },
    {
      type: 'action',
      label: 'Refresh',
      icon: 'element-refresh',
      action: () => this.logEvent('refresh')
    }
  ];

  readonly helpPanel = viewChild.required('helpPanel', { read: CdkPortal });
  readonly layoutPanel = viewChild.required('layoutPanel', { read: CdkPortal });

  appItems: App[] = [
    {
      name: 'Assets',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'Fischbach',
      iconUrl: './assets/app-icons/fischbach.svg',
      favorite: true,
      href: '.'
    },
    {
      name: 'Rocket',
      iconUrl: './assets/app-icons/rocket.svg',
      href: '.'
    },
    {
      name: 'Statistics',
      iconUrl: './assets/app-icons/statistics.svg',
      href: '.'
    }
  ];

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
      label: 'Energy & Sustainability',
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

  statusBarCompact = false;

  primaryActions = [{ title: 'Toggle panel', action: () => this.sidePanelService.open() }];

  shouldBlink = !navigator.webdriver;

  private sidePanelService = inject(SiSidePanelService);

  ngOnDestroy(): void {
    this.sidePanelService.hideTemporaryContent();
  }

  showHelp(): void {
    this.sidePanelService.showTemporaryContent(this.helpPanel());
  }

  showLayout(): void {
    this.sidePanelService.showTemporaryContent(this.layoutPanel());
  }
}
