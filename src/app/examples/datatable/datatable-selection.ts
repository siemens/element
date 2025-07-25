/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiFormModule } from '@siemens/element-ng/form';
import { NgxDatatableModule, SelectionType } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiCardComponent, SiFormModule, FormsModule],
  templateUrl: './datatable-selection.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;

  selected: any[] = [];
  rows: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  selectionTypes: SelectionType[] = ['single', 'multi', 'multiClick', 'checkbox', 'cell'];
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  selectionType: SelectionType | undefined;

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
