/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiNChartGaugeComponent } from '@spike-rabbit/native-charts-ng/gauge';

@NgModule({
  imports: [SiNChartGaugeComponent],
  exports: [SiNChartGaugeComponent]
})
export class SiNativeChartsNgModule {}

export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
