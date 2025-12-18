/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

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
    (gridReady)="onGridReady($event)"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  // Row Data: The data to be displayed.
  rowData: any[] = [];
  loading = true;
  private gridApi!: GridApi;

  defaultColDef: ColDef = {
    flex: 1,
    cellRenderer: 'agSkeletonCellRenderer'
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
    this.gridApi = params.api;

    // Show placeholder rows immediately
    this.rowData = Array(10).fill({});

    // Simulate loading delay
    setTimeout(() => {
      this.loading = false;
      // Remove skeleton renderer from default column definition
      this.defaultColDef = {
        flex: 1
      };
      // Update data
      this.rowData = sampleRowData;
    }, 2000);
  }
}
