/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMicroDonutComponent } from './components/si-micro-donut/si-micro-donut.component';
import { SiNChartGaugeComponent } from './components/si-nchart-gauge/si-nchart-gauge.component';

@NgModule({
  imports: [SiNChartGaugeComponent, SiMicroDonutComponent],
  exports: [SiNChartGaugeComponent, SiMicroDonutComponent]
})
export class SiNativeChartsNgModule {}

export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
