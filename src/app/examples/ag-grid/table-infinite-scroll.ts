/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HttpClient } from '@angular/common/http';
/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { LOG_EVENT } from '@siemens/live-preview';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellValueChangedEvent,
  ColDef,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  IDatasource,
  IGetRowsParams
} from 'ag-grid-community';

@Component({
  selector: 'app-loading-cell-renderer',
  imports: [SiLoadingSpinnerComponent],
  template: `
    @if (isLoading) {
      <si-loading-spinner [isBlockingSpinner]="true"/>
    } @else {
      {{ value }}
    }
  `
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class LoadingCellRenderer {
  isLoading = false;
  value: any;

  agInit(params: ICellRendererParams): void {
    this.isLoading = !params.data;
    this.value = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    this.isLoading = !params.data;
    this.value = params.value;
    return true;
  }
}



@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: ` <ag-grid-angular
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [gridOptions]="gridOptions"
    [loading]="loading"
    [rowSelection]="{
      mode: 'multiRow'
    }"
    (cellValueChanged)="onCellValueChanged($event)"
    (gridReady)="onGridReady($event)"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  private logEvent = inject(LOG_EVENT);
  private http = inject(HttpClient);
  rowData!: any[];
  loading = false;


  gridOptions: GridOptions = {
    rowModelType: 'infinite',
    cacheBlockSize: 100,
    infiniteInitialRowCount: 5,
    cacheOverflowSize: 2,
    maxBlocksInCache: 2
  };

  colDefs: ColDef[] = [
    {
      headerName: 'ID',
      maxWidth: 100,
      // it is important to have node.id here, so that when the id changes (which happens
      // when the row is loaded) then the cell is refreshed.
      valueGetter: 'node.id',
      cellRenderer: LoadingCellRenderer
    },
    { field: 'athlete', minWidth: 150 ,  cellRenderer: LoadingCellRenderer },
    { field: 'age' },
    { field: 'country', minWidth: 150 },
    { field: 'year' },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' }
  ];
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100
  };
  autoGroupColumnDef: ColDef = {
    minWidth: 200
  };
  rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';
  groupDefaultExpanded = 1;

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.logEvent('Cell Value Changed', event);
  }

  ngOnInit(): void {
    document.body.dataset.agThemeMode = 'dark';
    this.loading = true;
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.http
      .get<any[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe(data => {
        this.loading = false;
        const dataSource: IDatasource = {
          rowCount: undefined,
          getRows: (rowParams: IGetRowsParams) => {
            this.logEvent('asking for ' + rowParams.startRow + ' to ' + rowParams.endRow);
            // At this point in your code, you would call the server.
            // To make the demo look real, wait for 500ms before returning
            setTimeout(() => {
              // take a slice of the total rows
              const rowsThisPage = data.slice(rowParams.startRow, rowParams.endRow);
              // if on or after the last page, work out the last row.
              let lastRow = -1;
              if (data.length <= rowParams.endRow) {
                lastRow = data.length;
              }
              // call the success callback
              rowParams.successCallback(rowsThisPage, lastRow);
            }, 5000);
          }
        };
        params.api!.setGridOption('datasource', dataSource);
      });
  }
}
