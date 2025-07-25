/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMicroProgressComponent } from './components/si-micro-progress/si-micro-progress.component';
import { SiNChartGaugeComponent } from './components/si-nchart-gauge/si-nchart-gauge.component';

@NgModule({
  imports: [SiNChartGaugeComponent, SiMicroProgressComponent],
  exports: [SiNChartGaugeComponent, SiMicroProgressComponent]
})
export class SiNativeChartsNgModule {}

export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
