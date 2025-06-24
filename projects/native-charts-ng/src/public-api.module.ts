/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiNChartGaugeComponent } from './components/si-nchart-gauge/si-nchart-gauge.component';

@NgModule({
  imports: [SiNChartGaugeComponent],
  exports: [SiNChartGaugeComponent]
})
export class ElementNativeChartsNgModule {}
