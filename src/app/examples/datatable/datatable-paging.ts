/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { Subscription } from 'rxjs';

import { CorporateEmployee, DataService, Page, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-paging.html',
  styleUrl: './datatable.scss',
  imports: [NgxDatatableModule, SiDatatableModule, SiPaginationComponent],
  providers: [DataService]
})
export class SampleComponent implements OnDestroy {
  tableConfig = SI_DATATABLE_CONFIG;

  page = new Page();
  rows = new Array<CorporateEmployee>();

  isLoading = false;
  subscription?: Subscription;

  private dataService = inject(DataService);

  constructor() {
    this.page.size = 10;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  setPage(pageRequest: PageRequest): void {
    this.subscription?.unsubscribe();
    this.isLoading = true;
    this.subscription = this.dataService.getResults(pageRequest).subscribe(pagedData => {
      this.page = pagedData.page;
      this.rows = pagedData.data;
      this.isLoading = false;
    });
  }
}
