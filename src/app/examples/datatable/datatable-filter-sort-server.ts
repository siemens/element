/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy, viewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';
import { Subscription } from 'rxjs';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-filter-sort-server.html',
  styleUrl: './datatable.scss',
  providers: [DataService]
})
export class SampleComponent implements OnDestroy {
  readonly table = viewChild(DatatableComponent);

  tableConfig = SI_DATATABLE_CONFIG;

  rows: CorporateEmployee[] = [].constructor(5);

  isLoading = false;

  private subscription?: Subscription;
  private dataService = inject(DataService);

  constructor() {
    this.fetchData({ offset: 0, pageSize: 50 });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  fetchData(pageRequest: PageRequest): void {
    this.isLoading = true;
    // Need some rows to display ghosts
    if (this.rows.length === 0) {
      this.rows = [].constructor(5);
    }
    const table = this.table();
    if (table) {
      // Whenever the filter changes, always go back to the first page
      table.offset = 0;
    }
    this.subscription?.unsubscribe();
    this.subscription = this.dataService.getResults(pageRequest).subscribe(data => {
      this.rows = data.data;
      this.isLoading = false;
    });
  }

  updateFilter(event: any): void {
    const val = event.target.value.toLowerCase();
    this.fetchData({ offset: 0, pageSize: 50, filter: val });
  }
  onSort(event: any): void {
    const sort = event.sorts[0];
    this.fetchData({ offset: 0, pageSize: 50, sort });
  }
}
