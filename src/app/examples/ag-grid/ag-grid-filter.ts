/**
 * Copyright (c) Siemens 2016 - 2026
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
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [rowData]="rowData"
    [rowDragManaged]="true"
    (gridReady)="onGridReady()"
  /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  private readonly tableDataService = inject(TableDataService);

  rowData: TableData[] = [];

  colDefs: ColDef<TableData>[] = [
    { field: 'id', headerName: 'ID', rowDrag: true },
    { field: 'name', filter: true, floatingFilter: true },
    { field: 'role' },
    {
      field: 'age',
      floatingFilter: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: params => {
        if (params.value == null) return '';
        return params.value + ' years';
      }
    },
    { field: 'company', headerName: 'Company', filter: true },
    {
      field: 'dateOfJoining',
      headerName: 'Date of Joining',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: Date) => {
          if (!cellValue) return -1;

          // Create date at midnight for comparison
          const cellDate = new Date(cellValue);
          cellDate.setHours(0, 0, 0, 0);

          const filterDate = new Date(filterLocalDateAtMidnight);
          filterDate.setHours(0, 0, 0, 0);

          if (cellDate < filterDate) {
            return -1;
          } else if (cellDate > filterDate) {
            return 1;
          }
          return 0;
        },
        buttons: ['clear', 'apply']
      }
    }
  ];

  defaultColDef: ColDef<TableData> = {
    flex: 1
  };

  onGridReady(): void {
    this.rowData = this.tableDataService.generateRows(100);
  }
}
