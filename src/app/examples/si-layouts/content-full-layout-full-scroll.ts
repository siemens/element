/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  SiAccountDetailsComponent,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SI_DATATABLE_CONFIG,
  SiDatatableInteractionDirective
} from '@siemens/element-ng/datatable';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { NavbarVerticalItem } from '@siemens/element-ng/navbar-vertical';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { NgxDatatableModule, PageEvent } from '@siemens/ngx-datatable';

import { DataService } from '../datatable/data.service';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiDatatableInteractionDirective,
    SiPaginationComponent,
    SiResizeObserverDirective,
    SiSearchBarComponent,
    RouterLink,
    SiAccountDetailsComponent,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './content-full-layout-full-scroll.html',
  providers: [DataService]
})
export class SampleComponent {
  menuItems: NavbarVerticalItem[] = [
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
  tableConfig = SI_DATATABLE_CONFIG;

  private dataService = inject(DataService);
  private readonly pageEvent = signal<PageEvent | undefined>(undefined);

  readonly tableData = rxResource({
    params: () => this.pageEvent(),
    defaultValue: { page: { size: 0, totalElements: 0, totalPages: 0, pageNumber: 0 }, data: [] },
    stream: ({ params }) => this.dataService.getResults(params)
  });

  setPage(pageRequest: PageEvent): void {
    this.pageEvent.set(pageRequest);
  }
}
