/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-empty-server.html',
  styleUrl: './datatable.scss',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  providers: [DataService]
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  rows: CorporateEmployee[] = [].constructor(5);
  isLoading = 0;

  private dataService = inject(DataService);

  constructor() {
    this.fetchData({ offset: 0, pageSize: 50 });
  }

  fetchData(pageRequest: PageRequest): void {
    this.isLoading++;
    this.dataService.getEmptyResults(pageRequest).subscribe(data => {
      this.rows = data.data;
      this.isLoading--;
    });
  }
}
