/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { TableData } from '../../mocks/table-data.mock';
import { injectIsRtl } from '../../shared/rtl';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `
    @for (rtl of [enableRtl()]; track rtl) {
      <ag-grid-angular
        style="width: 100%; height: 100%;"
        [enableRtl]="rtl"
        [rowData]="rowData"
        [columnDefs]="colDefs"
        [defaultColDef]="defaultColDef"
        [noRowsOverlayComponentParams]="{
          icon: 'element-technical-operator',
          heading: 'No data to display',
          content: 'There are currently no rows to display in this table.'
        }"
      />
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  protected readonly enableRtl = injectIsRtl();
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
