/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { SimplChartsNgModule } from '@spike-rabbit/charts-ng';
import { WidgetConfig, WidgetInstance } from '@spike-rabbit/dashboards-ng';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';
import { Observable } from 'rxjs';

import { CartesianChartData, DataService } from '../../../widgets/charts/data.service';

export interface WidgetChartCartesianConfig {
  stacked: boolean;
  showLegend: boolean;
  themeCustomization?: any;
}

@Component({
  selector: 'app-cartesian',
  imports: [SimplChartsNgModule, SiResizeObserverDirective, AsyncPipe],
  templateUrl: './cartesian.component.html'
})
export class CartesianComponent implements OnInit, WidgetInstance {
  readonly config = input.required<WidgetConfig>();
  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Print', action: () => alert('do print') }
  ];
  secondaryActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Configure view',
      action: () => alert('Widget specific configuration completed.')
    },
    { type: 'action', label: 'Send to customer', action: () => alert('Sending completed.') }
  ];

  data!: Observable<CartesianChartData>;

  private dataService = inject(DataService);

  ngOnInit(): void {
    this.data = (this.dataService as any)[this.config().payload.datasourceId]();
  }

  get cartesianConfig(): WidgetChartCartesianConfig {
    return this.config().payload.config as WidgetChartCartesianConfig;
  }
}
