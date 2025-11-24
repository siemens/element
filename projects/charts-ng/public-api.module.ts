/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { SiChartComponent } from '@siemens/charts-ng/chart';
import { SiChartCircleComponent } from '@siemens/charts-ng/circle';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartGaugeComponent } from '@siemens/charts-ng/gauge';
import { SiChartProgressComponent } from '@siemens/charts-ng/progress';
import { SiChartProgressBarComponent } from '@siemens/charts-ng/progress-bar';
import { SiChartSankeyComponent } from '@siemens/charts-ng/sankey';
import { SiChartSunburstComponent } from '@siemens/charts-ng/sunburst';

/**
 * @deprecated The {@link SiChartsNgModule} is deprecated and will be removed in v51.
 * We recommend importing individual components to avoid unnecessary module imports.
 * Starting with v49, separate entry points are available for each component, allowing applications
 * to import components from specific entry points, which helps reduce the application bundle size.
 */
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
    SiChartProgressBarComponent,
    SiChartProgressComponent,
    SiChartSankeyComponent,
    SiChartSunburstComponent,
    SiCustomLegendComponent
  ]
})
export class SiChartsNgModule {}

export { SiChartsNgModule as SimplChartsNgModule };
