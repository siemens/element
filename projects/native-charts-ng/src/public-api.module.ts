/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMicroBarComponent } from './components/si-micro-bar/si-micro-bar.component';
import { SiNChartGaugeComponent } from './components/si-nchart-gauge/si-nchart-gauge.component';

@NgModule({
  imports: [SiNChartGaugeComponent, SiMicroBarComponent],
  exports: [SiNChartGaugeComponent, SiMicroBarComponent]
})
export class SiNativeChartsNgModule {}

export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
