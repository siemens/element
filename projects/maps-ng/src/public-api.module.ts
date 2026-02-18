/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMapModule } from './components/si-map/index';

@NgModule({
  exports: [SiMapModule]
})
export class SiMapsNgModule {}

/**
 * @deprecated Use {@link SiMapsNgModule} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
export { SiMapsNgModule as SimplMapsNgModule };
