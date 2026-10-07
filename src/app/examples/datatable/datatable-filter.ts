/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiTableSearchTextComponent } from '@siemens/element-ng/table-search-text';
import { DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiDatatableModule,
    SiEmptyStateComponent,
    SiTableSearchTextComponent,
    FormField
  ],
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
  protected readonly filterValue = signal('');
  protected readonly filterField = form(this.filterValue);

  readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => this.dataService.getResults(params)
  });

  readonly rows = computed(() => {
    const data = this.dataResource.value();
    // The ghost loading indicator styles existing rows, so provide five placeholders until data arrives.
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

  resetOffset(): void {
    // Whenever the filter changes, always go back to the first page
    this.offset = 0;
  }
}
