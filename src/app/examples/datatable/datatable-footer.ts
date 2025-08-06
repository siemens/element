/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiResizeObserverModule } from '@spike-rabbit/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiResizeObserverModule],
  templateUrl: './datatable-footer.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;
  rows: any[] = [];

  constructor() {
    for (let i = 1; i <= 250; i++) {
      this.rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        age: 10 + (i % 9)
      });
    }
  }
}
