/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule],
  templateUrl: './datatable-tree.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent implements OnInit {
  rows: any[] = [];

  tableConfig = SI_DATATABLE_CONFIG;

  columns: TableColumn[] = [];
  pageNumber = 0;

  constructor() {
    for (let i = 1; i <= 20; i++) {
      this.rows.push({
        name: 'First ' + i,
        role: i % 2 ? 'Engineer' : 'Installer',
        company: 'Company ' + i,
        age: 10 + (i % 9),
        treeStatus: 'collapsed'
      });
    }

    for (let i = 1; i <= 20; i++) {
      this.rows.push({
        name: 'First ' + (i + 20),
        manager: 'First ' + i,
        treeStatus: 'disabled'
      });
    }
  }

  ngOnInit(): void {
    this.initTableColumns();
  }

  private initTableColumns(): void {
    this.columns = [
      {
        prop: 'name',
        name: 'Name',
        isTreeColumn: true
      },
      {
        prop: 'role',
        name: 'Role'
      },
      {
        prop: 'age',
        name: 'Age',
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell'
      }
    ];
  }

  onTreeAction(event: any): void {
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.rows = [...this.rows];
  }
}
