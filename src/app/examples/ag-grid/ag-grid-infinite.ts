/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LOG_EVENT } from '@siemens/live-preview';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellValueChangedEvent,
  ColDef,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams
} from 'ag-grid-community';

import { TableData, TableDataService } from '../../mocks/table-data.mock';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 100%; height: 100%;"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [gridOptions]="gridOptions"
      [rowSelection]="{
        mode: 'multiRow'
      }"
      (cellValueChanged)="onCellValueChanged($event)"
      (gridReady)="onGridReady($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly tableDataService = inject(TableDataService);
  private allData: TableData[] = [];

  gridOptions: GridOptions = {
    rowModelType: 'infinite',
    cacheBlockSize: 20,
    infiniteInitialRowCount: 10,
    cacheOverflowSize: 2,
    maxBlocksInCache: 2
  };

  colDefs: ColDef<TableData>[] = [
    {
      headerName: 'ID',
      maxWidth: 100,
      // it is important to have node.id here, so that when the id changes (which happens
      // when the row is loaded) then the cell is refreshed.
      valueGetter: 'node.id'
    },
    { field: 'name', minWidth: 150 },
    { field: 'role', minWidth: 150 },
    {
      field: 'age',
      valueFormatter: params => {
        if (params.value == null) return '';
        return params.value + ' years';
      }
    },
    { field: 'company', headerName: 'Company', minWidth: 150 }
  ];

  defaultColDef: ColDef<TableData> = {
    flex: 1,
    minWidth: 100,
    cellRenderer: (params: any) => {
      if (!params.node?.data) {
        // Return skeleton HTML for loading rows centered vertically
        return '<div style="display: flex; align-items: center; height: 100%;"><div class="ag-skeleton-effect"></div></div>';
      }
      return params.valueFormatted ?? params.value;
    }
  };

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.logEvent('Cell Value Changed', event);
  }

  onGridReady(params: GridReadyEvent<TableData>): void {
    // Generate 500 rows of data
    this.allData = this.tableDataService.generateRows(500);

    const dataSource: IDatasource = {
      rowCount: undefined,
      getRows: (rowParams: IGetRowsParams) => {
        this.logEvent('asking for ' + rowParams.startRow + ' to ' + rowParams.endRow);
        // Simulate server delay
        setTimeout(() => {
          // Take a slice of the total rows
          const rowsThisPage = this.allData.slice(rowParams.startRow, rowParams.endRow);
          // If on or after the last page, work out the last row
          let lastRow = -1;
          if (this.allData.length <= rowParams.endRow) {
            lastRow = this.allData.length;
          }
          // Call the success callback
          rowParams.successCallback(rowsThisPage, lastRow);
        }, 5000);
      }
    };

    // Set datasource after render to avoid API call during render stage
    setTimeout(() => {
      params.api.setGridOption('datasource', dataSource);
    });
  }
}
