/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, INumberFilterParams } from 'ag-grid-community';

import { CarDefs, generateCarRows } from '../../mocks/car-defs.mock';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 100%;"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [rowData]="rowData"
    [rowDragManaged]="true"
    (gridReady)="onGridReady()"
  /> `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  rowData: CarDefs[] = [];

  colDefs: ColDef<CarDefs>[] = [
    { field: 'id', headerName: 'ID', rowDrag: true },
    { field: 'make', filter: true, floatingFilter: true },
    { field: 'model' },
    {
      field: 'price',
      floatingFilter: true,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['apply', 'reset'],
        closeOnApply: true
      } as INumberFilterParams,
      valueFormatter: params => {
        if (params.value == null) return '';
        return '$' + params.value.toLocaleString();
      }
    },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture', filter: true }
  ];

  defaultColDef: ColDef<CarDefs> = {
    flex: 1
  };

  onGridReady(): void {
    this.rowData = generateCarRows(100);
  }
}
