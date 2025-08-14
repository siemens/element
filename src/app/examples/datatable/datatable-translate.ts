/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { TranslateService, TranslationObject } from '@ngx-translate/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule],
  templateUrl: './datatable-translate.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent implements OnInit {
  rows: any[] = [];

  tableConfig = SI_DATATABLE_CONFIG;

  columns: TableColumn[] = [];
  pageNumber = 0;
  private translate = inject(TranslateService);

  constructor() {
    for (let i = 1; i <= 20; i++) {
      this.rows.push({
        name: 'First ' + i,
        role: i % 2 ? 'Engineer' : 'Installer',
        company: 'Company ' + i,
        age: 10 + (i % 9)
      });
    }
  }

  ngOnInit(): void {
    this.translate
      .get(['DATATABLE.HEADER.FIRST_NAME', 'DATATABLE.HEADER.ROLE', 'DATATABLE.HEADER.AGE'])
      .subscribe(translations => {
        this.initTableColumns(translations);
      });
  }

  private initTableColumns(translations: TranslationObject): void {
    this.columns = [
      {
        prop: 'name',
        name: translations['DATATABLE.HEADER.FIRST_NAME']
      },
      {
        prop: 'role',
        name: translations['DATATABLE.HEADER.ROLE']
      },
      {
        prop: 'age',
        name: translations['DATATABLE.HEADER.AGE'],
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell'
      }
    ];
  }
}
