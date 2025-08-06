/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiEmptyStateComponent],
  templateUrl: './datatable-empty-custom.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;
}
