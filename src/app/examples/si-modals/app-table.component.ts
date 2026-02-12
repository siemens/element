/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from '../datatable/data.service';

@Component({
  selector: 'app-table',
  imports: [NgxDatatableModule, SiDatatableModule, SiResizeObserverModule],
  templateUrl: './app-table.component.html',
  providers: [DataService]
})
export class AppTableComponent {
  logEvent = inject(LOG_EVENT);
  tableConfig = SI_DATATABLE_CONFIG;
  rows: CorporateEmployee[] = [];
  columns!: TableColumn[];

  pageNumber = 0;

  totalElements = 0;
  saveDisabled = false;

  isLoading = 0;
  private dataService = inject(DataService);
  private cdRef = inject(ChangeDetectorRef);

  modalRef = inject(ModalRef);

  onSelect(event: CorporateEmployee[]): void {
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
      this.cdRef.markForCheck();
    });
  }
}
