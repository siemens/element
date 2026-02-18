/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  viewChild
} from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-filter.html',
  styleUrl: './datatable.scss',
  providers: [DataService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  readonly table = viewChild.required(DatatableComponent);

  tableConfig = SI_DATATABLE_CONFIG;

  rows: CorporateEmployee[] = [].constructor(5);
  offset = 0;
  temp: CorporateEmployee[] = [];
  isLoading = 0;

  private dataService = inject(DataService);
  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    this.fetchData({ offset: 0, pageSize: 50 });
  }

  fetchData(pageRequest: PageRequest): void {
    this.isLoading++;
    this.dataService.getResults(pageRequest).subscribe(data => {
      this.temp = [...data.data];
      this.rows = data.data;
      this.isLoading--;
      this.cdRef.markForCheck();
    });
  }

  updateFilter(event: any): void {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(e => e.name.toLowerCase().includes(val) || !val);

    // update the rows
    this.rows = temp;

    // Whenever the filter changes, always go back to the first page
    this.offset = 0;
  }
}
