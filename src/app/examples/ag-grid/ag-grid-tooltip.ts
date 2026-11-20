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
        [autoSizeStrategy]="{
          type: 'fitGridWidth'
        }"
        [rowSelection]="{
          mode: 'multiRow'
        }"
        (gridReady)="onGridReady()"
      />
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  // `enableRtl` is an initial-only grid option, so the grid is re-created on direction change
  protected readonly enableRtl = injectIsRtl();
  private readonly tableDataService = inject(TableDataService);
  rowData: TableData[] = [];

  colDefs: ColDef<TableData>[] = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'name',
      filter: true,
      headerTooltip: 'Tooltip for Name Column Header',
      tooltip: p => 'This is a dynamic tooltip using the value of ' + p.value
    },
    { field: 'role', headerTooltip: 'Tooltip for Role Column Header' },
    {
      field: 'age',
      valueFormatter: params => {
        if (params.value == null) return '';
        return params.value + ' years';
      },
      headerTooltip: 'Tooltip for Age Column Header',
      tooltip: p => 'This is a dynamic tooltip using the value of ' + p.value
    },
    {
      field: 'company',
      headerTooltip: 'Tooltip for Company Column Header',
      headerName: 'Company'
    }
  ];

  onGridReady(): void {
    this.rowData = this.tableDataService.generateRows(15);
  }
}
