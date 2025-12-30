/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { SiContentActionBarComponent } from '@siemens/element-ng/content-action-bar';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { LOG_EVENT } from '@siemens/live-preview';

interface EnergySource {
  name: string;
  consumption: number;
  unit: string;
  percentage: number;
  status: 'success' | 'warning' | 'danger';
}

interface Building {
  name: string;
  energyUsage: number;
  carbonFootprint: number;
  efficiency: number;
  status: 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [
    CommonModule,
    SiCardComponent,
    SiContentActionBarComponent,
    SiCircleStatusComponent,
    SiInlineNotificationComponent,
    SiEmptyStateComponent,
    SiPaginationComponent
  ],
  templateUrl: './si-dashboard-energy.html',
  styleUrl: './si-dashboard-energy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'si-layout-fixed-height' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  // Dashboard data
  totalEnergyConsumption = signal(12456); // kWh
  totalCost = signal(2891); // USD
  carbonReduction = signal(15); // % vs last month

  energySources = signal<EnergySource[]>([
    {
      name: 'Solar',
      consumption: 4200,
      unit: 'kWh',
      percentage: 34,
      status: 'success'
    },
    {
      name: 'Wind',
      consumption: 3150,
      unit: 'kWh',
      percentage: 25,
      status: 'success'
    },
    {
      name: 'Grid',
      consumption: 5106,
      unit: 'kWh',
      percentage: 41,
      status: 'warning'
    }
  ]);

  buildings = signal<Building[]>([
    {
      name: 'Building A - Main Office',
      energyUsage: 4500,
      carbonFootprint: 1200,
      efficiency: 92,
      status: 'success'
    },
    {
      name: 'Building B - Manufacturing',
      energyUsage: 5800,
      carbonFootprint: 1800,
      efficiency: 78,
      status: 'warning'
    },
    {
      name: 'Building C - Warehouse',
      energyUsage: 2156,
      carbonFootprint: 540,
      efficiency: 85,
      status: 'success'
    }
  ]);

  recentAlerts = signal<Array<{ time: string; message: string; type: string }>>([
    {
      time: '14:32',
      message: 'Peak energy consumption detected in Building B',
      type: 'warning'
    },
    {
      time: '12:15',
      message: 'Solar panels operating at 98% efficiency',
      type: 'success'
    },
    {
      time: '10:45',
      message: 'Grid demand response activated',
      type: 'info'
    }
  ]);

  currentPage = signal(1);
  itemsPerPage = 3;

  onViewDetails(building: Building): void {
    this.logEvent(`View details for ${building.name}`);
  }

  onOptimize(): void {
    this.logEvent('Energy optimization recommendations requested');
  }

  onRefresh(): void {
    this.logEvent('Dashboard data refreshed');
  }

  onDownloadReport(): void {
    this.logEvent('Energy report downloaded');
  }

  getStatusLabel(efficiency: number): string {
    if (efficiency >= 90) return 'Excellent';
    if (efficiency >= 75) return 'Good';
    return 'Needs Improvement';
  }

  getStatusType(efficiency: number): 'success' | 'warning' | 'danger' {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 75) return 'warning';
    return 'danger';
  }
}
