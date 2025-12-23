/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { CarDefs, generateCarRows } from '../../mocks/car-defs.mock';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [pagination]="true"
    [paginationPageSize]="50"
    (gridReady)="onGridReady()"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  rowData: CarDefs[] = [];

  defaultColDef: ColDef<CarDefs> = {
    flex: 1,
    suppressHeaderMenuButton: false
  };

  colDefs: ColDef<CarDefs>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make', pinned: 'left' },
    { field: 'model' },
    { field: 'price' },
    { field: 'dateOfManufacture', pinned: 'right' }
  ];

  onGridReady(): void {
    this.rowData = generateCarRows(100);
  }
}
