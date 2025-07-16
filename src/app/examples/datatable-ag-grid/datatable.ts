/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { elementGridTheme } from '@siemens/element-ng/ag-grid';
import { LOG_EVENT } from '@siemens/live-preview';
import { AgGridAngular } from 'ag-grid-angular';
import { CellValueChangedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';

import { sampleRowData } from './mock-data';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  templateUrl: './datatable.html',
  styles: `
    .ag-grid-element {
      width: 100%;
      height: 550px;
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent implements OnInit {
  private logEvent = inject(LOG_EVENT);
  // Row Data: The data to be displayed.
  rowData!: any[];

  defaultColDef: ColDef = {
    editable: true,
    flex: 1
  };

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', flex: 0.25 },
    { field: 'make', filter: true, editable: false },
    { field: 'model' },
    {
      field: 'price',
      valueFormatter: params => {
        return '$' + params.value.toLocaleString();
      },
      filter: 'agNumberColumnFilter'
    },
    { field: 'electric' },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture' },
    {
      field: 'action',
      resizable: true
    }
  ];

  theme = elementGridTheme;

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.logEvent('Cell value changed:', event.value);
  }

  ngOnInit(): void {
    document.body.dataset.agThemeMode = 'dark';
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.rowData = sampleRowData;
  }
}
