/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiStatusCounterComponent } from '@siemens/element-ng/status-counter';

/**
 * @deprecated Using `SiIconStatusModule` and `SiIconStatusComponent` is deprecated. Instead
 * use `SiStatusCounterComponent` and `si-status-counter`.
 */
@NgModule({
  imports: [SiStatusCounterComponent],
  exports: [SiStatusCounterComponent]
})
export class SiIconStatusModule {}
