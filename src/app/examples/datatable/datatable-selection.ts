/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { ColumnMode, NgxDatatableModule, SelectionType } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-selection.html',
  styleUrl: './datatable.scss',
  imports: [NgxDatatableModule, SiDatatableModule, SiCardComponent]
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  selected: any[] = [];
  rows: any[] = [];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  ColumnMode = ColumnMode;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SelectionType = SelectionType;

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
