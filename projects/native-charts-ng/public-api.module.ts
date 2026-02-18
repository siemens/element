/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiNChartGaugeComponent } from '@siemens/native-charts-ng/gauge';

@NgModule({
  imports: [SiNChartGaugeComponent],
  exports: [SiNChartGaugeComponent]
})
export class SiNativeChartsNgModule {}

/**
 * @deprecated Use {@link SiNativeChartsNgModule} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
