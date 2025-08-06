/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { SimplChartsNgModule } from '@spike-rabbit/charts-ng';
import { WidgetConfig, WidgetInstance } from '@spike-rabbit/dashboards-ng';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';
import { Observable } from 'rxjs';

import { DataService } from '../../../widgets/charts/data.service';

export interface WidgetChartGaugeData {
  value: number;
}

export type WidgetChartGaugeConfig = {
  minValue: number;
  maxValue: number;
  splitSteps: number;
};

@Component({
  selector: 'app-gauge',
  imports: [SimplChartsNgModule, SiResizeObserverDirective, AsyncPipe],
  templateUrl: './gauge.component.html'
})
export class GaugeComponent implements OnInit, WidgetInstance {
  readonly config = input.required<WidgetConfig>();

  data?: Observable<number>;

  private dataService = inject(DataService);

  ngOnInit(): void {
    this.data = (this.dataService as any)[this.config().payload.datasourceId]();
  }

  get gaugeConfig(): WidgetChartGaugeConfig {
    return this.config().payload?.config as WidgetChartGaugeConfig;
  }
}
