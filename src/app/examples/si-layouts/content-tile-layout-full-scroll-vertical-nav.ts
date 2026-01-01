/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiAccountDetailsComponent,
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
    SiAccountDetailsComponent,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiLaunchpadFactoryComponent,
    SiSystemBannerComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './content-tile-layout-full-scroll-vertical-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  protected readonly shouldBlink = !navigator.webdriver;
  protected readonly hideSystemBanner = toSignal(
    of(true).pipe(delay(navigator.webdriver ? 15000 : 5000))
  );
  protected readonly collapsed = signal(true);
  protected readonly mode = signal<SidePanelMode>('scroll');
  protected readonly size = signal<SidePanelSize>('regular');

  protected readonly menuItems: NavbarVerticalItem[] = [
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

  protected readonly statusItems: StatusBarItem[] = [
    { title: 'Emergency', status: 'danger', value: 4, action: item => this.logEvent(item) },
    { title: 'Life safety', status: 'danger', value: 0, action: item => this.logEvent(item) },
    { title: 'Security', status: 'danger', value: 0 },
    { title: 'Supervisory', status: 'danger', value: 0 },
    { title: 'Trouble', status: 'warning', value: 42, action: item => this.logEvent(item) },
    { title: 'Success', status: 'success', value: 200, action: item => this.logEvent(item) }
  ];

  protected counter(i: number): undefined[] {
    return new Array(i);
  }

  protected toggle(): void {
    this.collapsed.update(value => !value);
  }

  protected toggleMode(): void {
    this.mode.update(value => (value === 'over' ? 'scroll' : 'over'));
  }

  protected changeSize(): void {
    this.size.update(value => (value === 'regular' ? 'wide' : 'regular'));
  }
}
