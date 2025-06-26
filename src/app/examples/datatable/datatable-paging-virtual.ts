/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';
import { ColumnMode, NgxDatatableModule, SelectEvent, SelectionType } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-paging-virtual.html',
  styleUrl: './datatable.scss',
  imports: [NgxDatatableModule, SiResizeObserverModule, SiDatatableModule],
  providers: [DataService]
})
export class SampleComponent {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected readonly SelectionType = SelectionType;

  logEvent = inject(LOG_EVENT);

  tableConfig = SI_DATATABLE_CONFIG;
  totalElements = 0;
  pageNumber = 0;

  rows: CorporateEmployee[] = [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ColumnMode = ColumnMode;

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
