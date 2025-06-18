/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { ColumnMode, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Subscription } from 'rxjs';

import { CorporateEmployee, DataService, Page, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-fixed-height.html',
  styleUrl: './datatable.scss',
  imports: [
    NgxDatatableModule,
    SiCardComponent,
    SiDatatableModule,
    SiPaginationComponent,
    FormsModule
  ],
  providers: [DataService]
})
export class SampleComponent implements OnDestroy {
  tableConfig = SI_DATATABLE_CONFIG;
  tableSize = 500;

  page = new Page();
  rows = new Array<CorporateEmployee>();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ColumnMode = ColumnMode;

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
