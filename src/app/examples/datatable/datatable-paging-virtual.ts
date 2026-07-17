/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { forkJoin } from 'rxjs';

import { CorporateEmployee, DataService, PagedData, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiResizeObserverModule, SiDatatableModule],
  templateUrl: './datatable-paging-virtual.html',
  styleUrl: './datatable.scss',
  providers: [DataService]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  tableConfig = SI_DATATABLE_CONFIG;
  readonly pageNumber = signal(0);

  private dataService = inject(DataService);
  private readonly pageRequest = signal<PageRequest | undefined>(undefined);

  readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => {
      const requests = [
        params.offset > 0 ? { ...params, offset: params.offset - 1 } : undefined,
        params,
        { ...params, offset: params.offset + 1 }
      ].filter(request => request !== undefined);
      return forkJoin(requests.map(request => this.dataService.getResults(request)));
    }
  });
  private readonly loadedData = linkedSignal<
    PagedData<CorporateEmployee>[] | undefined,
    { rows: CorporateEmployee[]; totalElements: number }
  >({
    source: this.dataResource.value,
    computation: (pagedDataPages, previous) => {
      if (!pagedDataPages) {
        return previous?.value ?? { rows: [], totalElements: 0 };
      }

      const rows = previous?.value.rows.slice() ?? [];
      for (const pagedData of pagedDataPages) {
        const start = pagedData.page.pageNumber * pagedData.page.size;
        if (rows.length <= start) {
          rows.length = start + 1;
        }
        rows.splice(start, pagedData.page.size, ...pagedData.data);
      }
      return { rows, totalElements: pagedDataPages[0]?.page.totalElements ?? 0 };
    }
  });
  readonly totalElements = computed(() => this.loadedData().totalElements);
  readonly rows = computed(() => this.loadedData().rows);

  onSelect(event: CorporateEmployee[]): void {
    this.logEvent(event);
  }

  setPage(pageRequest: PageRequest): void {
    // current page number is determined by last call to setPage
    this.pageNumber.set(pageRequest.offset);

    const currentRequest = this.pageRequest();
    if (
      currentRequest?.offset === pageRequest.offset &&
      currentRequest.pageSize === pageRequest.pageSize
    ) {
      return;
    }

    this.pageRequest.set(pageRequest);
  }
}
