/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit, viewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiIconModule } from '@spike-rabbit/element-ng/icon';
import { SiResizeObserverModule } from '@spike-rabbit/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiResizeObserverModule, SiIconModule],
  standalone: true,
  templateUrl: './datatable-grouped-rows.html'
})
export class SampleComponent implements OnInit {
  readonly table = viewChild.required(DatatableComponent);

  tableConfig = SI_DATATABLE_CONFIG;
  rows: any[] = groupedRows;
  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.columns = [
      {
        prop: 'toggle',
        name: '',
        width: 85,
        canAutoResize: false,
        resizeable: false,
        headerCheckboxable: true
      },
      { prop: 'component', name: 'Component', checkboxable: true },
      { prop: 'location', name: 'Location' },
      { prop: 'status', name: 'Status' },
      { prop: 'energyConsumption', name: 'Energy Consumption (kWh)' }
    ];
  }

  toggleExpandGroup(group: any): void {
    this.table().groupHeader?.toggleExpandGroup(group);
  }
}

export const groupedRows = [
  {
    system: 'HVAC',
    component: 'Air Conditioner',
    location: 'Floor 1',
    status: 'Operational',
    energyConsumption: 120
  },
  {
    system: 'HVAC',
    component: 'Heater',
    location: 'Floor 2',
    status: 'Operational',
    energyConsumption: 200
  },
  {
    system: 'HVAC',
    component: 'Ventilation Fan',
    location: 'Roof',
    status: 'Maintenance Required',
    energyConsumption: 150
  },
  {
    system: 'Lighting',
    component: 'LED Panel',
    location: 'Conference Room',
    status: 'Operational',
    energyConsumption: 50
  },
  {
    system: 'Lighting',
    component: 'Smart Bulb',
    location: 'Office A',
    status: 'Operational',
    energyConsumption: 10
  },
  {
    system: 'Lighting',
    component: 'Emergency Light',
    location: 'Corridor',
    status: 'Operational',
    energyConsumption: 5
  },
  {
    system: 'Security',
    component: 'CCTV Camera',
    location: 'Main Entrance',
    status: 'Operational',
    energyConsumption: 30
  },
  {
    system: 'Security',
    component: 'Access Control',
    location: 'Server Room',
    status: 'Operational',
    energyConsumption: 25
  },
  {
    system: 'Security',
    component: 'Motion Sensor',
    location: 'Parking Lot',
    status: 'Operational',
    energyConsumption: 15
  },
  {
    system: 'Energy Management',
    component: 'Smart Meter',
    location: 'Utility Room',
    status: 'Operational',
    energyConsumption: 5
  },
  {
    system: 'Energy Management',
    component: 'Solar Panel',
    location: 'Rooftop',
    status: 'Operational',
    energyConsumption: -50
  },
  {
    system: 'Energy Management',
    component: 'Battery Storage',
    location: 'Basement',
    status: 'Operational',
    energyConsumption: 10
  }
];
