/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiSidePanelContentComponent } from './si-side-panel-content.component';
import { SiSidePanelComponent } from './si-side-panel.component';

@NgModule({
  imports: [SiSidePanelComponent, SiSidePanelContentComponent],
  exports: [SiSidePanelComponent, SiSidePanelContentComponent]
})
export class SiSidePanelModule {}
