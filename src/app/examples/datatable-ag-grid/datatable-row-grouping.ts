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
  theme = elementGridTheme;
  rowData!: any[];

  colDefs: ColDef[] = [
    { field: 'make', filter: true, editable: false, rowGroup: true, rowGroupIndex: 0 },
    { field: 'model', rowGroup: true, rowGroupIndex: 1 },
    {
      field: 'price',
      valueFormatter: params => {
        if (params.value) {
          return '$' + params.value.toLocaleString();
        }
        return '';
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
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.rowData = sampleRowData;
  }
}
