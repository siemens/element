/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiCardComponent],
  templateUrl: './datatable-selection.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  selected: any[] = [];
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
