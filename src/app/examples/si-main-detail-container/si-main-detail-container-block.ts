/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiMainDetailContainerComponent } from '@siemens/element-ng/main-detail-container';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarModule } from '@siemens/element-ng/search-bar';
import { LOG_EVENT } from '@siemens/live-preview';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from '../datatable/data.service';

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    SiMainDetailContainerComponent,
    SiSearchBarModule,
    SiContentActionBarComponent,
    NgxDatatableModule,
    SiDatatableModule,
    SiEmptyStateComponent
  ],
  templateUrl: './si-main-detail-container-block.html',
  styleUrl: './si-main-detail-container-block.scss',
  providers: [DataService]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private dataService = inject(DataService);

  /**
   * Main detail container
   */
  largeLayoutBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum; // this is the default
  detailsActive = false; // this is the default
  heading = 'Main-Detail Container Example';
  truncateHeading = true;
  detailsHeading = 'Details';
  resizableParts = true;
  isLarge = true;

  /**
   * To force a demonstration of the condensed layout, we use a maxWidth
   * value for the whole container.
   */
  containerMaxWidth: number | undefined;

  /**
   * Main actions
   */
  public mainActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Add',
      action: () => this.logEvent('Add triggered'),
      disabled: false
    }
  ];

  /**
   * Main data (table)
   */
  cache: any = {};
  isLoading = 0;
  pageNumber = 0;
  pageSize = 50;
  rows: CorporateEmployee[] = [];
  selectedEntity: CorporateEmployee | undefined;
  selectedEntities: CorporateEmployee[] = [];
  tableConfig = SI_DATATABLE_CONFIG;
  totalElements = 0;
  searchTerm?: string;

  /**
   * Detail data
   */
  detailActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Edit',
      action: () => this.logEvent('Edit triggered'),
      disabled: false
    }
  ];

  datatableOnSelect(items: CorporateEmployee[]): void {
    this.selectedEntities = [...items];
    this.selectedEntity = this.selectedEntities[0];
    this.detailsActive = true;
    this.logEvent(this.selectedEntities);
  }

  searchTermChanged(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.cache = {};
    this.totalElements = 0;
    this.rows = [];
    this.setPage({ offset: 0, pageSize: this.pageSize, filter: searchTerm });
  }

  setPage(pageRequest: PageRequest): void {
    pageRequest.filter = this.searchTerm;
    // current page number is determined by last call to setPage
    this.pageNumber = pageRequest.offset;

    // if page size changed, the primitive cache can't handle it, so clear
    if (this.pageSize !== pageRequest.pageSize) {
      this.cache = {};
    }
    this.pageSize = pageRequest.pageSize;

    // don't load same data twice
    if (this.cache[pageRequest.offset]) {
      return;
    }
    this.cache[pageRequest.offset] = true;

    // counter of pages loading
    this.isLoading++;

    this.dataService.getResults(pageRequest).subscribe(pagedData => {
      // update total count
      this.totalElements = pagedData.page.totalElements;

      // create array to store data if missing
      if (!this.rows) {
        // length should be total count
        this.rows = new Array<CorporateEmployee>(pagedData.page.totalElements || 0);
      }

      // calc starting index
      const start = pagedData.page.pageNumber * pagedData.page.size;

      // copy existing data
      const rows = [...this.rows];

      // insert new rows into new position
      rows.splice(start, pagedData.page.size, ...pagedData.data);

      // set rows to our new rows
      this.rows = rows;

      this.isLoading--;
    });
  }

  toggleMobileLayout(condensed: boolean): void {
    this.containerMaxWidth = condensed ? BOOTSTRAP_BREAKPOINTS.smMinimum : undefined;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
}
