/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiSidePanelActionComponent } from './si-side-panel-action.component';
import { SiSidePanelActionsComponent } from './si-side-panel-actions.component';
import { SiSidePanelBackButtonComponent } from './si-side-panel-back-button.component';
import { SiSidePanelContentComponent } from './si-side-panel-content.component';
import { SiSidePanelComponent } from './si-side-panel.component';

@NgModule({
  imports: [
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiSidePanelActionsComponent,
    SiSidePanelActionComponent,
    SiSidePanelBackButtonComponent
  ],
  exports: [
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiSidePanelActionsComponent,
    SiSidePanelActionComponent,
    SiSidePanelBackButtonComponent
  ]
})
export class SiSidePanelModule {}
