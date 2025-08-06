/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-empty-server.html',
  styleUrl: './datatable.scss',
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
