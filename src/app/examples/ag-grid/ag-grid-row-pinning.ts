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
    [pinnedTopRowData]="pinnedTopRowData"
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
  pinnedTopRowData: TableData[] = [];

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
    const rows = this.tableDataService.generateRows(200);

    const [pinned, regular] = rows.reduce<[TableData[], TableData[]]>(
      (acc: [TableData[], TableData[]], row: TableData) => {
        (row.id < 3 ? acc[0] : acc[1]).push(row);
        return acc;
      },
      [[], []]
    );
    this.pinnedTopRowData = pinned;
    this.rowData = regular;
  }
}
