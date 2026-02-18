/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-empty-server.html',
  styleUrl: './datatable.scss',
  providers: [DataService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  rows: CorporateEmployee[] = [].constructor(5);
  isLoading = 0;

  private dataService = inject(DataService);
  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    this.fetchData({ offset: 0, pageSize: 50 });
  }

  fetchData(pageRequest: PageRequest): void {
    this.isLoading++;
    this.dataService.getEmptyResults(pageRequest).subscribe(data => {
      this.rows = data.data;
      this.isLoading--;
      this.cdRef.markForCheck();
    });
  }
}
