/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiNChartGaugeComponent } from '@siemens/native-charts-ng/gauge';

/**
 * @deprecated Both SimplNativeChartsNgModule and SiNativeChartsNgModule are deprecated and will be removed in v52.
 */
@NgModule({
  imports: [SiNChartGaugeComponent],
  exports: [SiNChartGaugeComponent]
})
export class SiNativeChartsNgModule {}

/**
 * @deprecated Use {@link SiNativeChartsNgModule} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
// eslint-disable-next-line @typescript-eslint/no-deprecated
export { SiNativeChartsNgModule as SimplNativeChartsNgModule };
