/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private destroyRef = inject(DestroyRef);
  private readonly tableDataService = inject(TableDataService);
  private cdRef = inject(ChangeDetectorRef);
  rowData: TableData[] = Array.from({ length: 10 }, () => ({})) as TableData[];

  defaultColDef: ColDef<TableData> = {
    flex: 1,
    cellRenderer: 'agSkeletonCellRenderer'
  };

  colDefs: ColDef<TableData>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name' },
    { field: 'role' },
    { field: 'company' },
    { field: 'age' }
  ];

  onGridReady(): void {
    this.tableDataService
      .getRows(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sampleRowData: TableData[]) => {
        // Remove skeleton renderer from default column definition
        this.defaultColDef = {
          ...this.defaultColDef,
          cellRenderer: undefined
        };
        // Update data
        this.rowData = sampleRowData;
        this.cdRef.markForCheck();
      });
  }
}
