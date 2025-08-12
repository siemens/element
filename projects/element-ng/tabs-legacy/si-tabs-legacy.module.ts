/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiTabLegacyComponent } from './si-tab/si-tab-legacy.component';
import { SiTabsetLegacyComponent } from './si-tabset/si-tabset-legacy.component';

const components = [SiTabsetLegacyComponent, SiTabLegacyComponent];

/**
 * @deprecated Use the new components from `@siemens/element-ng/tabs` instead.
 * See {@link https://element.siemens.io/components/layout-navigation/tabs/#code}
 * for usage instructions.
 */
@NgModule({
  imports: components,
  exports: components
})
export class SiTabsLegacyModule {}
