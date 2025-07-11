/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { SiNavbarModule } from '@siemens/element-ng/navbar';
import { NavbarVerticalItem, SiNavbarVerticalModule } from '@siemens/element-ng/navbar-vertical';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule, SiNavbarVerticalModule],
  templateUrl: './si-navbar-vertical-legacy.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  menuItems: MenuItem[] = [
    {
      title: 'Home',
      id: 'home',
      icon: 'element-home',
      link: 'Home',
      tooltip: 'Home',
      items: [
        {
          title: 'Sub Item',
          link: 'subItem',
          tooltip: 'Sub Item 1',
          badge: 4,
          badgeColor: 'warning'
        },
        { title: 'Sub Item 2', link: 'subItem2', tooltip: 'Sub Item 2' },
        { title: 'Sub Item 3', link: 'subItem3', tooltip: 'Sub Item 3' }
      ]
    },
    {
      title: 'Documentation',
      id: 'documentation',
      icon: 'element-document',
      tooltip: 'Documentation',
      items: [
        { title: 'Sub Item 4', link: 'subItem4', tooltip: 'Sub Item 4' },
        { title: 'Sub Item 5', link: 'subItem5', tooltip: 'Sub Item 5' },
        { title: 'Sub Item 6', link: 'subItem6', tooltip: 'Sub Item 6' }
      ]
    },
    {
      title: 'Energy & Sustainability',
      icon: 'element-trend',
      link: 'energy',
      tooltip: 'Energy & Sustainability'
    },
    {
      title: 'Test Coverage',
      icon: 'element-diagnostic',
      link: 'coverage',
      tooltip: 'Test Coverage',
      badge: 4,
      badgeColor: 'danger'
    }
  ];

  logEvent = inject(LOG_EVENT);

  onItemsChange(anyItems: (MenuItem | NavbarVerticalItem)[]): void {
    const items = anyItems as MenuItem[];
    let msg = '';
    items.forEach(item =>
      item.expanded
        ? (msg = msg + `${item.title} expanded; `)
        : (msg = msg + `${item.title} collapsed; `)
    );
    this.logEvent(msg);
  }
}
