/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiPaginationComponent } from '@spike-rabbit/element-ng/pagination';
import { Subscription } from 'rxjs';

import { CorporateEmployee, DataService, Page, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiCardComponent,
    SiDatatableModule,
    SiPaginationComponent,
    FormsModule
  ],
  templateUrl: './datatable-fixed-height.html',
  styleUrl: './datatable.scss',
  providers: [DataService]
})
export class SampleComponent implements OnDestroy {
  tableConfig = SI_DATATABLE_CONFIG;
  tableSize = 500;

  page = new Page();
  rows = new Array<CorporateEmployee>();

  isLoading = false;
  subscription?: Subscription;

  private dataService = inject(DataService);

  constructor() {
    this.page.size = Math.floor(
      (this.tableSize - this.tableConfig.headerHeight - this.tableConfig.footerHeight) /
        this.tableConfig.rowHeightSmall
    );
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

  onTableSizeChange(): void {
    this.page.size = Math.floor(
      (this.tableSize - this.tableConfig.headerHeight - this.tableConfig.footerHeight) /
        this.tableConfig.rowHeightSmall
    );
  }
}
