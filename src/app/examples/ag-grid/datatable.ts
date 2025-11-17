/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { elementTheme } from '@siemens/element-ng/ag-grid';
import { LOG_EVENT } from '@siemens/live-preview';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

import { sampleRowData } from './mock-data';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    class="ag-grid-element"
    [theme]="theme"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [pagination]="true"
    [rowSelection]="{
      mode: 'multiRow'
    }"
    (gridReady)="onGridReady($event)"
  />`,
  styles: `
    .ag-grid-element {
      width: 100%;
      height: 550px;
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  private logEvent = inject(LOG_EVENT);
  // Row Data: The data to be displayed.
  rowData!: any[];

  defaultColDef: ColDef = {
    flex: 1,
    suppressHeaderMenuButton: true
  };

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', flex: 0.25 },
    { field: 'make' },
    { field: 'model' },
    {
      field: 'price',
      valueFormatter: params => {
        return '$' + params.value.toLocaleString();
      }
    },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture' },
    {
      field: 'action',
      resizable: true
    }
  ];

  theme = elementTheme;

  ngOnInit(): void {
    document.body.dataset.agThemeMode = 'dark';
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.rowData = sampleRowData;
  }
}
