/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
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
import { BreadcrumbItem, SiBreadcrumbComponent } from '@spike-rabbit/element-ng/breadcrumb';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemComponent,
  SiHeaderDropdownTriggerDirective
} from '@spike-rabbit/element-ng/header-dropdown';
import {
  NavbarVerticalItem,
  SiNavbarVerticalComponent
} from '@spike-rabbit/element-ng/navbar-vertical';
import { SiSearchBarComponent } from '@spike-rabbit/element-ng/search-bar';
import {
  SiSidePanelComponent,
  SiSidePanelContentComponent
} from '@spike-rabbit/element-ng/side-panel';
import { SiStatusBarComponent, StatusBarItem } from '@spike-rabbit/element-ng/status-bar';
import { SiTourService, TourStep } from '@spike-rabbit/element-ng/tour';

@Component({
  selector: 'app-sample',
  imports: [
    SiAccordionComponent,
    SiBreadcrumbComponent,
    SiCollapsiblePanelComponent,
    SiNavbarVerticalComponent,
    SiSearchBarComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiStatusBarComponent,
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderDropdownComponent,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderDropdownItemComponent,
    SiLaunchpadFactoryComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-tour.html'
})
export class SampleComponent implements AfterViewInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Root', link: 'root' },
    { title: 'Level 1', link: ['root', 'level1'] },
    { title: 'Level 2', link: ['root', 'level1', 'level2'] }
  ];

  statusItems: StatusBarItem[] = [
    { title: 'Security', status: 'danger', value: 4 },
    { title: 'Update', status: 'warning', value: 14 },
    { title: 'Information', status: 'info', value: 37 }
  ];

  appItems: App[] = [
    { name: 'Account', iconClass: 'element-account', href: './account-app' },
    { name: 'Asset', iconClass: 'element-floor', href: './asset-app' },
    {
      name: 'Operations',
      iconClass: 'element-plant',
      href: './oprtations-app',
      active: true
    },
    { name: 'App Portal', iconClass: 'element-security', href: './app-portal' },
    {
      name: 'App Service',
      iconClass: 'element-automation-station',
      href: './app-service'
    },
    { name: 'App Tool', iconClass: 'element-global', href: './app-tool' }
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
        {
          type: 'router-link',
          label: 'Sub Item 2',
          routerLink: 'subItem2'
        },
        {
          type: 'router-link',
          label: 'Sub Item 3',
          routerLink: 'subItem3'
        }
      ]
    },
    {
      type: 'group',
      label: 'Documentation',
      icon: 'element-document',
      children: [
        {
          type: 'router-link',
          label: 'Sub Item 4',
          routerLink: 'subItem4'
        },
        {
          type: 'router-link',
          label: 'Sub Item 5',
          routerLink: 'subItem5'
        },
        {
          type: 'router-link',
          label: 'Sub Item 6',
          routerLink: 'subItem6'
        }
      ]
    },
    {
      type: 'router-link',
      label: 'Energy',
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

  startTour = (): void => this.tourService.start();

  private tourService = inject(SiTourService);

  constructor() {
    const steps = this.getSteps();
    this.tourService.addSteps(steps);
  }

  ngAfterViewInit(): void {
    this.tourService.start();
  }

  ngOnDestroy(): void {
    this.tourService.complete();
  }

  private timeout = async (ms?: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

  private getSteps(): TourStep[] {
    return [
      {
        attachTo: {
          element: 'si-status-bar'
        },
        id: 'status-bar',
        title: 'Status bar',
        text: 'Information about events or actions that requires user attention.'
      },
      {
        attachTo: {
          element: '.main-content h2'
        },
        id: 'page-title',
        title: 'Page title',
        text: 'Title describing the page content.'
      },
      {
        attachTo: {
          element: '.mb-6 si-search-bar input'
        },
        id: 'search-bar',
        title: 'Search bar',
        text: 'Search bar to search information in the page.'
      },
      {
        attachTo: {
          element: 'si-navbar-vertical nav'
        },
        id: 'navbar',
        title: 'Vertical navbar',
        text: 'Hierarchical global navigation displaying navigation options.',
        beforeShowPromise: () => this.timeout(400)
      },
      {
        attachTo: {
          element: 'si-side-panel-content'
        },
        id: 'side-panel',
        title: 'Side panel',
        text: 'The side panel is used to display additional content or functionality that is related to the main content of a page.'
      },
      {
        attachTo: {
          element: 'si-header-dropdown.show'
        },
        id: 'help-menu',
        title: 'Help menu',
        text: 'The help menu provides help in case you need it.',
        beforeShowPromise: () => {
          document.querySelector<HTMLButtonElement>('si-header-actions .element-help')?.click();
          return this.timeout(100);
        },
        beforeNextPromise: () => {
          // click again to hide menu
          const menu = document.querySelector('si-header-dropdown.show');
          if (menu) {
            document.querySelector<HTMLButtonElement>('si-header-actions .element-help')?.click();
            return this.timeout(20);
          }
          return Promise.resolve();
        }
      },
      {
        id: 'finish',
        title: 'Tour completed',
        text: 'The guided tour is now complete. Thank you.'
      }
    ];
  }
}
