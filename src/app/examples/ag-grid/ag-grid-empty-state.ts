/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { CarDefs } from '../../mocks/car-defs.mock';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 100%; height: 100%;"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [noRowsOverlayComponentParams]="{
        icon: 'element-technical-operator',
        heading: 'No data to display',
        content: 'There are currently no rows to display in this table.'
      }"
    />
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  rowData: CarDefs[] = []; // Empty array to show the overlay

  defaultColDef: ColDef<CarDefs> = {
    flex: 1
  };

  colDefs: ColDef<CarDefs>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture' }
  ];
}
