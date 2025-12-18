/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, IsRowPinned } from 'ag-grid-community';

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
    [pinnedTopRowData]="pinnedTopRowData"
    (gridReady)="onGridReady($event)"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  // Row Data: The data to be displayed.
  rowData!: any[];
  pinnedTopRowData!: any[];

  defaultColDef: ColDef = {
    flex: 1
  };

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'dateOfManufacture' },
    { field: 'action' }
  ];

  ngOnInit(): void {
    document.body.dataset.agThemeMode = 'dark';
  }

  onGridReady(params: GridReadyEvent<any>): void {
    // Separate pinned rows from regular rows
    this.pinnedTopRowData = sampleRowData.filter(row => row.id < 3);
    this.rowData = sampleRowData.filter(row => row.id >= 3);
  }
}
