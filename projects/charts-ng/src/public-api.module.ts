/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiChartComponent } from '@siemens/charts-ng/chart';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { SiChartSankeyComponent } from '@siemens/charts-ng/sankey';
import { SiChartSunburstComponent } from '@siemens/charts-ng/sunburst';

import { SiChartCartesianComponent } from './components/si-chart-cartesian/si-chart-cartesian.component';
import { SiChartCircleComponent } from './components/si-chart-circle/si-chart-circle.component';
import { SiChartGaugeComponent } from './components/si-chart-gauge/si-chart-gauge.component';
import { SiChartProgressBarComponent } from './components/si-chart-progress-bar/si-chart-progress-bar.component';
import { SiChartProgressComponent } from './components/si-chart-progress/si-chart-progress.component';

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
