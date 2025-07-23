/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMicroLineComponent } from './components/si-micro-line/si-micro-line.component';
import { SiNChartGaugeComponent } from './components/si-nchart-gauge/si-nchart-gauge.component';

@NgModule({
  imports: [SiNChartGaugeComponent, SiMicroLineComponent],
  exports: [SiNChartGaugeComponent, SiMicroLineComponent]
})
export class SiNativeChartsNgModule {}

export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
