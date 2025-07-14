/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiResizeObserverDirective } from './si-resize-observer.directive';
import { SiResponsiveContainerDirective } from './si-responsive-container.directive';

@NgModule({
  imports: [SiResizeObserverDirective, SiResponsiveContainerDirective],
  exports: [SiResizeObserverDirective, SiResponsiveContainerDirective]
})
export class SiResizeObserverModule {}
