/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateModule } from '@siemens/element-ng/empty-state';
import { Filter, SiFilterBarComponent } from '@siemens/element-ng/filter-bar';
import { SiIconComponent } from '@siemens/element-ng/icon';
import {
  SiDetailsPaneBodyComponent,
  SiDetailsPaneComponent,
  SiDetailsPaneFooterComponent,
  SiDetailsPaneHeaderComponent,
  SiListDetailsComponent,
  SiListPaneBodyComponent,
  SiListPaneComponent,
  SiListPaneHeaderComponent
} from '@siemens/element-ng/list-details';
import {
  MenuItem,
  SiMenuBarDirective,
  SiMenuDirective,
  SiMenuHeaderDirective,
  SiMenuItemComponent
} from '@siemens/element-ng/menu';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { LOG_EVENT } from '@siemens/live-preview';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from '../datatable/data.service';

interface TabModel {
  heading: string;
  closable?: boolean;
  disabled?: boolean;
  icon?: string;
  iconAltText?: string;
  badgeColor?: string;
  badgeContent?: string;
}

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    SiListDetailsComponent,
    SiListPaneComponent,
    SiListPaneHeaderComponent,
    SiListPaneBodyComponent,
    SiDetailsPaneComponent,
    SiDetailsPaneHeaderComponent,
    SiDetailsPaneBodyComponent,
    SiDetailsPaneFooterComponent,
    SiIconComponent,
    SiMenuBarDirective,
    SiMenuItemComponent,
    SiSearchBarComponent,
    SiFilterBarComponent,
    SiTabsetComponent,
    SiTabComponent,
    NgxDatatableModule,
    SiDatatableModule,
    SiEmptyStateModule,
    SiMenuDirective,
    SiMenuHeaderDirective,
    CdkMenuTrigger
  ],
  templateUrl: './si-list-details.html',
  host: {
    class: 'si-layout-fixed-height'
  },
  providers: [DataService]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  private dataService = inject(DataService);

  /**
   * List details
   */
  expandBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum; // this is the default
  detailsActive = false; // this is the default
  disableResizing = false;

  /**
   * To force a demonstration of the condensed layout, we use a maxWidth
   * value for the whole component.
   */
  maxWidth: number | undefined;

  /**
   * List actions
   */
  listActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Add',
      action: () => this.logEvent('Add triggered')
    }
  ];

  /**
   * Filters
   */
  filters: Filter[] = [
    {
      filterName: 'date',
      title: 'Date',
      description: '27-12-2022',
      status: 'default'
    },
    {
      filterName: 'location',
      title: 'Location',
      description: 'Zug',
      status: 'default'
    }
  ];

  /**
   * List data (table)
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
   * Details data
   */
  detailsActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Edit',
      action: () => this.logEvent('Edit triggered')
    }
  ];

  selectedTabIndex = 0;

  tabs: TabModel[] = [
    { heading: 'Overview' },
    {
      heading: 'History'
    },
    {
      heading: 'Advanced',
      disabled: true
    }
  ];

  closeTab(tab: TabModel): void {
    this.tabs.splice(this.tabs.indexOf(tab), 1);
  }

  onDiscard(): void {
    this.logEvent('Discard');
  }

  onSave(): void {
    this.logEvent('Save');
  }

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
      // create array to store data if missing
      if (!this.rows || this.totalElements !== pagedData.page.totalElements) {
        // length should be total count
        this.rows = new Array<CorporateEmployee>(pagedData.page.totalElements || 0);
      }
      // update total count
      this.totalElements = pagedData.page.totalElements;

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
}
