/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PagedData, PageRequest } from './data.service';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-empty-server.html',
  styleUrl: './datatable.scss',
  providers: [DataService]
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  private dataService = inject(DataService);
  private readonly pageRequest = signal<PageRequest>({ offset: 0, pageSize: 50 });

  readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => this.dataService.getEmptyResults(params),
    defaultValue: new PagedData<CorporateEmployee>()
  });
}
