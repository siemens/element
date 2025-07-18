/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { BreadcrumbItem, SiBreadcrumbComponent } from '@siemens/element-ng/breadcrumb';
import { SiCardComponent } from '@siemens/element-ng/card';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';
import { SiStatusBarComponent, StatusBarItem } from '@siemens/element-ng/status-bar';

@Component({
  selector: 'app-sample',
  imports: [
    RouterLink,
    FormsModule,
    SiApplicationHeaderComponent,
    SiBreadcrumbComponent,
    SiCardComponent,
    SiContentActionBarComponent,
    SiFormItemComponent,
    SiHeaderBrandDirective,
    SiNavbarVerticalComponent,
    SiSearchBarComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiStatusBarComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-page-header.html'
})
export class SampleComponent {
  readonly breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Root', link: 'root' },
    { title: 'Level 1', link: ['root', 'level1'] },
    { title: 'Level 2', link: ['root', 'level1', 'level2'] }
  ];

  readonly statusItems: StatusBarItem[] = [
    { title: 'Security', status: 'danger', value: 0 },
    { title: 'Supervisory', status: 'danger', value: 0 },
    { title: 'Not clickable', status: 'info', value: 37 }
  ];

  readonly primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Print', action: () => alert('Print') },
    { type: 'action', label: 'Share', action: () => alert('Share') },
    {
      type: 'group',
      label: 'Save As',
      children: [
        { type: 'action', label: 'Save as New Trend', action: () => alert('Save as New Trend') },
        { type: 'action', label: 'Save as a Copy', action: () => alert('Save as a Copy') },
        { type: 'action', label: 'Save as a Template', action: () => alert('Save as a Template') }
      ]
    }
  ];

  readonly secondaryActions: MenuItem[] = [
    {
      type: 'group',
      label: 'Download as',
      children: [
        { type: 'action', label: 'Image', action: () => alert('Image') },
        { type: 'action', label: 'File', action: () => alert('File') }
      ]
    },
    { type: 'action', label: 'Copy', action: () => alert('Copy') },
    { type: 'action', label: 'Hide', action: () => alert('Hide') },
    { type: 'action', label: 'Export', action: () => alert('Export') },
    { type: 'action', label: 'Favorite', action: () => alert('Favorite') }
  ];

  protected status = true;
  protected breadcrumb = true;
  protected description = true;
  protected actions = true;
  protected toolbar = true;
}
