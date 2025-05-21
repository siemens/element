/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiNavbarItemComponent } from './si-navbar-item/si-navbar-item.component';
import { SiNavbarPrimaryComponent } from './si-navbar-primary/si-navbar-primary.component';

const components = [SiNavbarItemComponent, SiNavbarPrimaryComponent];

/** @deprecated Use the new `si-application-header` instead. */
@NgModule({
  imports: components,
  exports: components
})
export class SiNavbarModule {}
