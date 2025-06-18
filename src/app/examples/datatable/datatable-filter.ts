/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, viewChild } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-filter.html',
  styleUrl: './datatable.scss',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  providers: [DataService]
})
export class SampleComponent {
  readonly table = viewChild.required(DatatableComponent);

  tableConfig = SI_DATATABLE_CONFIG;

  rows: CorporateEmployee[] = [].constructor(5);
  temp: CorporateEmployee[] = [];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  ColumnMode = ColumnMode;
  isLoading = 0;

  private dataService = inject(DataService);

  constructor() {
    this.fetchData({ offset: 0, pageSize: 50 });
  }

  fetchData(pageRequest: PageRequest): void {
    this.isLoading++;
    this.dataService.getResults(pageRequest).subscribe(data => {
      this.temp = [...data.data];
      this.rows = data.data;
      this.isLoading--;
    });
  }

  updateFilter(event: any): void {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(e => e.name.toLowerCase().includes(val) || !val);

    // update the rows
    this.rows = temp;

    // Whenever the filter changes, always go back to the first page
    this.table().offset = 0;
  }
}
