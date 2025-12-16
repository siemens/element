/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

import { sampleRowData } from './mock-data';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [pagination]="true"
    [rowSelection]="{
      mode: 'multiRow'
    }"
    (gridReady)="onGridReady($event)"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  // Row Data: The data to be displayed.
  rowData!: any[];

  defaultColDef: ColDef = {
    flex: 1,
    suppressHeaderMenuButton: true
  };

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', flex: 0.25 },
    { field: 'make', filter: true },
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

  ngOnInit(): void {
    document.body.dataset.agThemeMode = 'dark';
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.rowData = sampleRowData;
  }
}
