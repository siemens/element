/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy } from '@angular/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiPaginationComponent } from '@spike-rabbit/element-ng/pagination';
import { Subscription } from 'rxjs';

import { CorporateEmployee, DataService, Page, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiPaginationComponent],
  templateUrl: './datatable-paging.html',
  styleUrl: './datatable.scss',
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
