/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  App,
  AppCategory,
  SiAccountDetailsComponent,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderCollapsibleActionsComponent,
  SiHeaderLogoDirective,
  SiLaunchpadFactoryComponent
} from '@siemens/element-ng/application-header';
import { BreadcrumbItem, SiBreadcrumbComponent } from '@siemens/element-ng/breadcrumb';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { MenuItem } from '@siemens/element-ng/menu';
import {
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextGroupComponent,
  SiNavbarVerticalNextGroupTriggerDirective,
  SiNavbarVerticalNextItemComponent,
  SiNavbarVerticalNextItemsComponent
} from '@siemens/element-ng/navbar-vertical-next';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';
import { SiStatusBarComponent, StatusBarItem } from '@siemens/element-ng/status-bar';
import { SiSystemBannerComponent } from '@siemens/element-ng/system-banner';

@Component({
  selector: 'app-sample',
  imports: [
    RouterLink,
    SiAccordionComponent,
    SiAccountDetailsComponent,
    SiApplicationHeaderComponent,
    SiBreadcrumbComponent,
    SiCollapsiblePanelComponent,
    SiContentActionBarComponent,
    SiHeaderAccountItemComponent,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderCollapsibleActionsComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownItemComponent,
    SiHeaderDropdownTriggerDirective,
    SiLaunchpadFactoryComponent,
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextItemsComponent,
    SiSearchBarComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiStatusBarComponent,
    SiSystemBannerComponent,
    SiHeaderLogoDirective,
    RouterLinkActive
  ],
  templateUrl: './anatomy-navbar-vertical-next.html'
})
export class SampleComponent {
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

  primaryActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Print',
      icon: 'element-print',
      action: () => alert('Print')
    },
    {
      type: 'action',
      label: 'Share',
      icon: 'element-share',
      action: () => alert('Share')
    },
    {
      type: 'group',
      label: 'Save As',
      icon: 'element-save',
      children: [
        {
          type: 'action',
          label: 'Save as New Trend',
          action: () => alert('Save as New Trend')
        },
        {
          type: 'action',
          label: 'Save as a Copy',
          action: () => alert('Save as a Copy')
        },
        {
          type: 'action',
          label: 'Save as a Template',
          action: () => alert('Save as a Template')
        }
      ]
    }
  ];

  secondaryActions: MenuItem[] = [
    {
      type: 'group',
      label: 'Download as',
      icon: 'element-download',
      children: [
        {
          type: 'action',
          label: 'Image',
          action: () => alert('Image')
        },
        {
          type: 'action',
          label: 'File',
          action: () => alert('File')
        }
      ]
    },
    {
      type: 'action',
      label: 'Copy',
      icon: 'element-copy',
      action: () => alert('Copy')
    },
    {
      type: 'action',
      label: 'Hide',
      icon: 'element-hide',
      action: () => alert('Hide')
    },
    {
      type: 'action',
      label: 'Export',
      icon: 'element-export',
      action: () => alert('Export')
    },
    {
      type: 'action',
      label: 'Favorite',
      icon: 'element-favorite',
      action: () => alert('Favorite')
    }
  ];

  categories: AppCategory[] = [
    {
      name: 'All apps',
      apps: [
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
      ]
    }
  ];

  updateFavorite({ app, favorite }: { app: App; favorite: boolean }): void {
    app.favorite = favorite;
    this.categories = [...this.categories];
  }
}
