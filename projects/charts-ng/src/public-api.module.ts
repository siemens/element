/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';

import { SiChartCartesianComponent } from './components/si-chart-cartesian/si-chart-cartesian.component';
import { SiChartCircleComponent } from './components/si-chart-circle/si-chart-circle.component';
import { SiChartGaugeComponent } from './components/si-chart-gauge/si-chart-gauge.component';
import { SiChartProgressBarComponent } from './components/si-chart-progress-bar/si-chart-progress-bar.component';
import { SiChartProgressComponent } from './components/si-chart-progress/si-chart-progress.component';
import { SiChartSankeyComponent } from './components/si-chart-sankey/si-chart-sankey.component';
import { SiChartSunburstComponent } from './components/si-chart-sunburst/si-chart-sunburst.component';
import { SiChartComponent } from './components/si-chart/si-chart.component';

@NgModule({
  imports: [
    SiChartCartesianComponent,
    SiChartCircleComponent,
    SiChartComponent,
    SiChartGaugeComponent,
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
    SiChartLoadingSpinnerComponent,
    SiChartProgressBarComponent,
    SiChartProgressComponent,
    SiChartSankeyComponent,
    SiChartSunburstComponent,
    SiCustomLegendComponent
  ]
})
export class SiChartsNgModule {}

export { SiChartsNgModule as SimplChartsNgModule };
