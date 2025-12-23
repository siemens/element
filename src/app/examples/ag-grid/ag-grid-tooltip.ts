/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ITooltipParams } from 'ag-grid-community';

import { CarDefs, generateCarRows } from '../../mocks/car-defs.mock';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [autoSizeStrategy]="{
      type: 'fitGridWidth'
    }"
    [rowSelection]="{
      mode: 'multiRow'
    }"
    (gridReady)="onGridReady()"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  rowData: CarDefs[] = [];

  colDefs: ColDef<CarDefs>[] = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'make',
      filter: true,
      headerTooltip: 'Tooltip for Make Column Header',
      tooltipValueGetter: (p: ITooltipParams) =>
        'This is a dynamic tooltip using the value of ' + p.value
    },
    { field: 'model', headerTooltip: 'Tooltip for Model Column Header' },
    {
      field: 'price',
      valueFormatter: params => {
        if (params.value == null) return '';
        return '$' + params.value.toLocaleString();
      },
      headerTooltip: 'Tooltip for Price Column Header',
      tooltipValueGetter: (p: ITooltipParams) =>
        'This is a dynamic tooltip using the value of ' + p.value
    },
    {
      field: 'dateOfManufacture',
      headerTooltip: 'Tooltip for Date of manufacture Column Header',
      headerName: 'Date of Manufacture'
    }
  ];

  onGridReady(): void {
    this.rowData = generateCarRows(15);
  }
}
