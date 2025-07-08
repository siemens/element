/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SiChartCartesianComponent } from './components/si-chart-cartesian/si-chart-cartesian.component';
import { SiChartCircleComponent } from './components/si-chart-circle/si-chart-circle.component';
import { SiChartGaugeComponent } from './components/si-chart-gauge/si-chart-gauge.component';
import { SiChartLoadingSpinnerComponent } from './components/si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartProgressBarComponent } from './components/si-chart-progress-bar/si-chart-progress-bar.component';
import { SiChartProgressComponent } from './components/si-chart-progress/si-chart-progress.component';
import { SiChartSankeyComponent } from './components/si-chart-sankey/si-chart-sankey.component';
import { SiChartSunburstComponent } from './components/si-chart-sunburst/si-chart-sunburst.component';
import { SiChartComponent } from './components/si-chart/si-chart.component';
import { SiCustomLegendComponent } from './components/si-custom-legend/si-custom-legend.component';

@NgModule({
  imports: [
    CommonModule,
    SiChartCartesianComponent,
    SiChartCircleComponent,
    SiChartComponent,
    SiChartGaugeComponent,
    SiChartLoadingSpinnerComponent,
    SiChartProgressBarComponent,
    SiChartProgressComponent,
    SiChartSankeyComponent,
    SiChartSunburstComponent,
    SiCustomLegendComponent
  ],
  exports: [
    SiChartCartesianComponent,
    SiChartCircleComponent,
    SiChartComponent,
    SiChartGaugeComponent,
    SiChartProgressBarComponent,
    SiChartProgressComponent,
    SiChartSankeyComponent,
    SiChartSunburstComponent,
    SiCustomLegendComponent
  ]
})
export class SiChartsNgModule {}
