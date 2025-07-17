/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { CircleChartSeries, SimplChartsNgModule } from '@siemens/charts-ng';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { Observable } from 'rxjs';

import { DataService } from '../../../widgets/charts/data.service';

@Component({
  selector: 'app-circle',
  imports: [SimplChartsNgModule, SiResizeObserverDirective, AsyncPipe],
  templateUrl: './circle.component.html'
})
export class CircleComponent implements OnInit, WidgetInstance {
  readonly config = input.required<WidgetConfig>();
  data!: Observable<CircleChartSeries[]>;

  private dataService = inject(DataService);

  ngOnInit(): void {
    this.data = (this.dataService as any)[this.config().payload.datasourceId]();
  }
}
