/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { TableData, TableDataService } from '../../mocks/table-data.mock';
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
        [pagination]="true"
        [paginationPageSize]="50"
        (gridReady)="onGridReady()"
      />
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  protected readonly enableRtl = injectIsRtl();
  private readonly tableDataService = inject(TableDataService);
  rowData: TableData[] = [];

  defaultColDef: ColDef<TableData> = {
    flex: 1
  };

  colDefs: ColDef<TableData>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', pinned: 'left' },
    { field: 'role' },
    { field: 'company' },
    { field: 'age', pinned: 'right' }
  ];

  onGridReady(): void {
    this.rowData = this.tableDataService.generateRows(100);
  }
}
