/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AgNoRowsOverlayComponent } from '@siemens/element-ng/ag-grid';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 100%; height: 100%;"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [noRowsOverlayComponent]="noRowsOverlayComponent"
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
  rowData: any[] = []; // Empty array to show the overlay
  noRowsOverlayComponent = AgNoRowsOverlayComponent;

  defaultColDef: ColDef = {
    flex: 1,
    suppressHeaderMenuButton: false
  };

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture' }
  ];
}
