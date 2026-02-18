/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { TableData } from '../../mocks/table-data.mock';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  rowData: TableData[] = []; // Empty array to show the overlay

  defaultColDef: ColDef<TableData> = {
    flex: 1
  };

  colDefs: ColDef<TableData>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name' },
    { field: 'role' },
    { field: 'company' },
    { field: 'age' }
  ];
}
