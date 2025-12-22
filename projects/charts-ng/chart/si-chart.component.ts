/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { echarts, SiChartBaseComponent } from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import {
  BarChart,
  LineChart,
  ScatterChart,
  CandlestickChart,
  HeatmapChart,
  PieChart,
  GaugeChart,
  SankeyChart,
  SunburstChart
} from 'echarts/charts';
import {
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  ToolboxComponent,
  BrushComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  AxisPointerComponent
} from 'echarts/components';
import { LegacyGridContainLabel } from 'echarts/features';

echarts.use([
  BarChart,
  LineChart,
  ScatterChart,
  CandlestickChart,
  HeatmapChart,
  PieChart,
  GaugeChart,
  SankeyChart,
  SunburstChart,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  ToolboxComponent,
  BrushComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  AxisPointerComponent,
  LegacyGridContainLabel
]);

@Component({
  selector: 'si-chart',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../common/si-chart-base.component.html',
  styleUrl: '../common/si-chart-base.component.scss'
})
export class SiChartComponent extends SiChartBaseComponent {}
