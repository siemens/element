/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-filter.html',
  styleUrl: './datatable.scss',
  providers: [DataService]
})
export class SampleComponent {
  readonly table = viewChild.required(DatatableComponent);

  tableConfig = SI_DATATABLE_CONFIG;

  offset = 0;

  private dataService = inject(DataService);
  private readonly pageRequest = signal<PageRequest>({ offset: 0, pageSize: 50 });
  private readonly filterValue = signal<string>('');

  readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => this.dataService.getResults(params)
  });

  readonly rows = computed(() => {
    const data = this.dataResource.value();
    const allRows: CorporateEmployee[] = data?.data ?? [].constructor(5);
    const filter = this.filterValue().toLowerCase();

    if (!filter) {
      return allRows;
    }

    // filter our data
    return allRows.filter(e => e.name.toLowerCase().includes(filter));
  });

  fetchData(pageRequest: PageRequest): void {
    this.pageRequest.set(pageRequest);
  }

  updateFilter(event: any): void {
    const val = event.target.value.toLowerCase();
    this.filterValue.set(val);

    // Whenever the filter changes, always go back to the first page
    this.offset = 0;
  }
}
