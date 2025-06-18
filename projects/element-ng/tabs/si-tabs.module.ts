/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiTabComponent } from './si-tab/si-tab.component';
import { SiTabsetComponent } from './si-tabset/si-tabset.component';

const components = [SiTabsetComponent, SiTabComponent];
@NgModule({
  imports: components,
  exports: components
})
export class SiTabsModule {}
