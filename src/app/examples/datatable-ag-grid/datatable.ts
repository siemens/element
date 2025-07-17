/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { elementGridTheme } from '@siemens/element-ng/ag-grid';
import { LOG_EVENT } from '@siemens/live-preview';
import { AgGridAngular } from 'ag-grid-angular';
import { CellValueChangedEvent, ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-sample',
  imports: [AgGridAngular],
  templateUrl: './datatable.html',
  host: {
    class: 'p-5'
  },
  styles: `
    .ag-grid-element {
      width: 100%;
      height: 550px;
    }
  `
})
export class SampleComponent implements OnInit {
  private logEvent = inject(LOG_EVENT);
  // Row Data: The data to be displayed.
  rowData = [
    {
      id: 1,
      make: 'Tesla',
      model: 'Model Y',
      price: 64950,
      electric: true,
      dateOfManufacture: '2023-01-01'
    },
    {
      id: 2,
      make: 'Ford',
      model: 'F-Series',
      price: 33850,
      electric: false,
      dateOfManufacture: '2022-01-01'
    },
    {
      id: 3,
      make: 'Toyota',
      model: 'Corolla',
      price: 29600,
      electric: false,
      dateOfManufacture: '2024-01-01'
    },
    {
      id: 4,
      make: 'Chevrolet',
      model: 'Silverado',
      price: 28900,
      electric: false,
      dateOfManufacture: '2025-01-01'
    },
    {
      id: 5,
      make: 'Honda',
      model: 'Civic',
      price: 22750,
      electric: false,
      dateOfManufacture: '2021-01-01'
    },
    {
      id: 6,
      make: 'Nissan',
      model: 'Leaf',
      price: 27400,
      electric: true,
      dateOfManufacture: '2020-01-01'
    },
    {
      id: 7,
      make: 'BMW',
      model: 'i3',
      price: 44450,
      electric: true,
      dateOfManufacture: '2021-01-01'
    },
    {
      id: 8,
      make: 'Hyundai',
      model: 'Kona Electric',
      price: 34900,
      electric: true,
      dateOfManufacture: '2023-01-01'
    },
    {
      id: 9,
      make: 'Volkswagen',
      model: 'ID.4',
      price: 39900,
      electric: true,
      dateOfManufacture: '2022-01-01'
    },
    {
      id: 10,
      make: 'Audi',
      model: 'e-tron',
      price: 65900,
      electric: true,
      dateOfManufacture: '2024-01-01'
    },
    {
      id: 11,
      make: 'Mercedes-Benz',
      model: 'EQC',
      price: 69900,
      electric: true,
      dateOfManufacture: '2023-01-01'
    },
    {
      id: 12,
      make: 'Porsche',
      model: 'Taycan',
      price: 103800,
      electric: true,
      dateOfManufacture: '2025-01-01'
    },
    {
      id: 13,
      make: 'Rivian',
      model: 'R1T',
      price: 67900,
      electric: true,
      dateOfManufacture: '2025-01-01'
    }
  ];

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
      }
    },
    { field: 'electric' },
    { field: 'dateOfManufacture', headerName: 'Date of Manufacture' },
    {
      field: 'action',
      resizable: true
    }
  ];

  theme = elementGridTheme.withParams({
    fontFamily: 'Siemens Sans, sans-serif',
  });

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.logEvent('Cell value changed:', event.value);
    // Here you can handle the cell value change event
    // For example, you can send the updated data to a server or perform some other action
  }

  ngOnInit(): void {
    document.body.dataset.agThemeMode = "dark";
  }
}
