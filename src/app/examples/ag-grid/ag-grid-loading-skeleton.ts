/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { CarDefs, getDynamicCarData } from '../../mocks/car-defs.mock';

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
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  private destroyRef = inject(DestroyRef);
  rowData: CarDefs[] = Array.from({ length: 10 }, () => ({})) as CarDefs[];

  defaultColDef: ColDef<CarDefs> = {
    flex: 1,
    cellRenderer: 'agSkeletonCellRenderer'
  };

  colDefs: ColDef<CarDefs>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'dateOfManufacture' }
  ];

  onGridReady(): void {
    getDynamicCarData(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(sampleRowData => {
        // Remove skeleton renderer from default column definition
        this.defaultColDef = {
          ...this.defaultColDef,
          cellRenderer: undefined
        };
        // Update data
        this.rowData = sampleRowData;
      });
  }
}
