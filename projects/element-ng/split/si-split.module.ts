/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiSplitPartComponent } from './si-split-part.component';
import { SiSplitComponent } from './si-split.component';

@NgModule({
  imports: [SiSplitComponent, SiSplitPartComponent],
  exports: [SiSplitComponent, SiSplitPartComponent]
})
export class SiSplitModule {}
