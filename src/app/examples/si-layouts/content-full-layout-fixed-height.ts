/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
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
import { ElementDimensions, SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, Page, PageRequest } from '../datatable/data.service';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiDatatableInteractionDirective,
    SiPaginationComponent,
    SiResizeObserverDirective,
    SiSearchBarComponent,
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './content-full-layout-fixed-height.html',
  providers: [DataService]
})
export class SampleComponent implements OnInit {
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
  pageRequest?: PageRequest;
  page = new Page();
  rows = new Array<CorporateEmployee>();
  isLoading = 0;

  private dataService = inject(DataService);

  ngOnInit(): void {
    // timeout needed to work in the iFrame in the docs
    setTimeout(() => this.updateTableData(), 500);
  }

  setPage(pageRequest: PageRequest): void {
    // We cache the latest page request and only fire a new request
    // if a different page or page size is requested.
    // For example, the user could click one different pages in the pagination
    // before the http results actually return.
    if (
      this.pageRequest?.offset !== pageRequest.offset ||
      this.pageRequest?.pageSize !== pageRequest.pageSize
    ) {
      this.pageRequest = pageRequest;
      this.isLoading++;
      // We reload the data when the page number or page size changes.
      // During this time, we want to show the ghost loading indicator.
      // To make sure no data is presented. We set the rows in the table
      // to an empty array.
      this.rows = [];
      this.dataService.getResults(pageRequest).subscribe(pagedData => {
        this.isLoading--;
        // Make sure we set the date to the latest page request.
        if (
          this.pageRequest?.offset === pageRequest.offset &&
          this.pageRequest?.pageSize === pageRequest.pageSize
        ) {
          this.page = pagedData.page;
          this.rows = pagedData.data;
        }
      });
    }
  }

  updateTableData(dimensions?: ElementDimensions): void {
    if (!dimensions) {
      return;
    }

    const bodyHeight =
      dimensions.height - SI_DATATABLE_CONFIG.headerHeight - SI_DATATABLE_CONFIG.footerHeight;
    const pageSize = Math.floor(bodyHeight / SI_DATATABLE_CONFIG.rowHeightSmall);
    this.page.size = pageSize;
    this.setPage({
      offset: this.page.pageNumber,
      pageSize: this.page.size
    });
  }
}
