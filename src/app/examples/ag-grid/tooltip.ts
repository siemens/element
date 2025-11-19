/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { elementTheme } from '@siemens/element-ng/ag-grid';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, ITooltipParams } from 'ag-grid-community';

import { sampleRowData } from './mock-data';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  template: `<ag-grid-angular
    style="width: 100%; height: 550px;"
    [theme]="theme"
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [defaultColDef]="defaultColDef"
    [tooltipInteraction]="true"
    [rowSelection]="{
      mode: 'singleRow'
    }"
    (gridReady)="onGridReady($event)"
  />`,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  // Row Data: The data to be displayed.
  rowData!: any[];

  defaultColDef: ColDef = {
    flex: 1,
    suppressHeaderMenuButton: true
  };

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    {
      field: 'make',
      headerTooltip: 'Tooltip for Make Column Header',
      tooltipValueGetter: (p: ITooltipParams) =>
        'This is a dynamic tooltip using the value of ' + p.value
    },
    { field: 'model', headerTooltip: 'Tooltip for Model Column Header' },
    {
      field: 'price',
      headerTooltip: 'Tooltip for Price Column Header',
      tooltipValueGetter: (p: ITooltipParams) =>
        'This is a dynamic tooltip using the value of ' + p.value,
      valueFormatter: params => {
        return '$' + params.value.toLocaleString();
      }
    },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture' },
    {
      field: 'action',
      resizable: true
    }
  ];

  theme = elementTheme;

  ngOnInit(): void {
    document.body.dataset.agThemeMode = 'dark';
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.rowData = sampleRowData;
  }
}
