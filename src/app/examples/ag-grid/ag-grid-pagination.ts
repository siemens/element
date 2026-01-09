/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { TableData, TableDataService } from '../../mocks/table-data.mock';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [pagination]="true"
    [paginationPageSize]="20"
    (gridReady)="onGridReady()"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  private readonly tableDataService = inject(TableDataService);
  rowData: TableData[] = [];

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

  onGridReady(): void {
    this.rowData = this.tableDataService.generateRows(500);
  }
}
