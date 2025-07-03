/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit, TemplateRef, viewChild } from '@angular/core';
import { SiCircleStatusModule } from '@siemens/element-ng/circle-status';
import { StatusType } from '@siemens/element-ng/common';
import { SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable-sticky-columns.html',
  styleUrl: './datatable.scss',
  imports: [NgxDatatableModule, SiDatatableModule, SiPaginationComponent, SiCircleStatusModule]
})
export class SampleComponent implements OnInit {
  readonly statusCellTempl = viewChild.required<TemplateRef<any>>('statusCellTempl');

  rows: any[] = [];
  columns!: TableColumn[];
  pageNumber = 0;

  noSelection = false;
  statusTypes: StatusType[] = ['success', 'info', 'warning', 'danger'];
  nextStatusType = 0;
  contextItems = [
    { title: 'Items 1', action: () => alert('Item 1') },
    { title: 'Items 2', action: () => alert('Item 2') }
  ];

  constructor() {
    for (let i = 1; i <= 250; i++) {
      this.rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        company: 'Siemens',
        address: `Siemens, Germany`,
        age: 10 + (i % 9),
        status: this.getStatusType(i)
      });
    }
  }

  ngOnInit(): void {
    this.initTableColumns();
  }

  private initTableColumns(): void {
    this.columns = [
      {
        prop: 'user',
        name: '',
        width: 80,
        resizeable: true,
        canAutoResize: false,
        cellTemplate: this.statusCellTempl(),
        checkboxable: false,
        headerCheckboxable: false,
        frozenLeft: true
      },
      {
        prop: 'id',
        name: 'ID',
        width: 50,
        resizeable: true,
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell',
        canAutoResize: false,
        frozenLeft: true
      },
      {
        prop: 'firstname',
        name: 'First Name',
        width: 150,
        resizeable: true,
        canAutoResize: false
      },
      {
        prop: 'lastname',
        name: 'Last Name',
        width: 150,
        resizeable: true,
        canAutoResize: false
      },
      {
        prop: 'company',
        name: 'Company',
        width: 150,
        resizeable: true,
        canAutoResize: false
      },
      {
        prop: 'address',
        name: 'Address',
        width: 600,
        resizeable: true,
        canAutoResize: false
      },
      {
        prop: 'age',
        name: 'Age',
        width: 50,
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell',
        resizeable: true,
        canAutoResize: false
      }
    ];
  }

  private getStatusType(row: number): StatusType | null {
    if (row % 4 !== 0) {
      return null;
    }
    this.nextStatusType = ++this.nextStatusType % this.statusTypes.length;
    return this.statusTypes[this.nextStatusType];
  }
}
