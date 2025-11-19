/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { elementTheme } from '@siemens/element-ng/ag-grid';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, INumberFilterParams } from 'ag-grid-community';

import { sampleRowData } from './mock-data';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 550px;"
    [columnDefs]="colDefs"
    [theme]="theme"
    [defaultColDef]="defaultColDef"
    [rowData]="rowData"
    [gridOptions]="{ headerHeight: 48 }"
    (gridReady)="onGridReady($event)"
  /> `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  // Row Data: The data to be displayed.
  rowData!: any[];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', flex: 0.25 },
    { field: 'make', filter: true, floatingFilter: true },
    { field: 'model' },
    {
      field: 'price',
      filter: true,
      floatingFilter: true,
      filterParams: priceFilterParams,
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

  defaultColDef: ColDef = {
    flex: 1,
    suppressHeaderMenuButton: true
    // minWidth: 150,
    //  filter: true
  };

  theme = elementTheme;

  onGridReady(params: GridReadyEvent<any>): void {
    this.rowData = sampleRowData;
  }
}

const priceFilterParams: INumberFilterParams = {
  allowedCharPattern: '\\d\\-\\,\\$',
  numberParser: (text: string | null) => {
    return text == null ? null : parseFloat(text.replace(',', '.').replace('$', ''));
  },
  numberFormatter: (value: number | null) => {
    return value == null ? null : value.toString().replace('.', ',');
  }
};
