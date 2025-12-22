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
    [pinnedTopRowData]="pinnedTopRowData"
    (gridReady)="onGridReady()"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  rowData: CarDefs[] = [];
  pinnedTopRowData: CarDefs[] = [];

  defaultColDef: ColDef<CarDefs> = {
    flex: 1
  };

  colDefs: ColDef<CarDefs>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'dateOfManufacture' }
  ];

  onGridReady(): void {
    const rows = generateCarRows(200);

    const [pinned, regular] = rows.reduce<[CarDefs[], CarDefs[]]>(
      (acc, row) => {
        (row.id < 3 ? acc[0] : acc[1]).push(row);
        return acc;
      },
      [[], []]
    );
    this.pinnedTopRowData = pinned;
    this.rowData = regular;
  }
}
