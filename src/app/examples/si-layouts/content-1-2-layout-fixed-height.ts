/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxDatatableModule, SelectEvent } from '@siemens/ngx-datatable';
import { SiChartCircleComponent, themeElement, themeSupport } from '@spike-rabbit/charts-ng';
import {
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@spike-rabbit/element-ng/application-header';
import {
  SI_DATATABLE_CONFIG,
  SiDatatableInteractionDirective
} from '@spike-rabbit/element-ng/datatable';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@spike-rabbit/element-ng/header-dropdown';
import { NavbarVerticalItem } from '@spike-rabbit/element-ng/navbar-vertical';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';
import { SiSearchBarComponent } from '@spike-rabbit/element-ng/search-bar';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

import { CorporateEmployee, DataService, PageRequest } from '../datatable/data.service';

themeSupport.setDefault(themeElement);

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiChartCircleComponent,
    SiDatatableInteractionDirective,
    SiResizeObserverDirective,
    SiSearchBarComponent,
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderDropdownComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './content-1-2-layout-fixed-height.html',
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
  logEvent = inject(LOG_EVENT);

  tableConfig = SI_DATATABLE_CONFIG;
  totalElements = 0;
  pageNumber = 0;

  rows: CorporateEmployee[] = [];

  isLoading = 0;

  private dataService = inject(DataService);

  onSelect(event: SelectEvent<CorporateEmployee>): void {
    this.logEvent(event);
  }

  setPage(pageRequest: PageRequest): void {
    // current page number is determined by last call to setPage
    this.pageNumber = pageRequest.offset;

    // counter of pages loading
    this.isLoading++;

    this.dataService.getResults(pageRequest).subscribe(pagedData => {
      // update total count
      this.totalElements = pagedData.page.totalElements;

      // calc starting index
      const start = pagedData.page.pageNumber * pagedData.page.size;

      // copy existing data
      const rows = this.rows.slice();

      // insert new rows into new position
      if (rows.length <= start) {
        rows.length = start + 1;
      }
      rows.splice(start, pagedData.page.size, ...pagedData.data);

      // set rows to our new rows
      this.rows = rows;

      this.isLoading--;
    });
  }
}
