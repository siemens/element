/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, Page, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiPaginationComponent],
  templateUrl: './datatable-paging.html',
  styleUrl: './datatable.scss',
  providers: [DataService]
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  private dataService = inject(DataService);
  private readonly initialPage = Object.assign(new Page(), { size: 10 });
  private readonly pageRequest = signal<PageRequest | undefined>(undefined);

  readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => this.dataService.getResults(params)
  });

  readonly page = linkedSignal<Page | undefined, Page>({
    source: () => this.dataResource.value()?.page,
    computation: (page, previous) => page ?? previous?.value ?? this.initialPage
  });
  readonly rows = linkedSignal<CorporateEmployee[] | undefined, CorporateEmployee[]>({
    source: () => this.dataResource.value()?.data,
    computation: (rows, previous) => rows ?? previous?.value ?? []
  });

  setPage(pageRequest: PageRequest): void {
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
