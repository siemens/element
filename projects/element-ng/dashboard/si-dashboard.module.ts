/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiDashboardCardComponent } from './si-dashboard-card.component';
import { SiDashboardComponent } from './si-dashboard.component';

@NgModule({
  imports: [SiDashboardCardComponent, SiDashboardComponent],
  exports: [SiDashboardCardComponent, SiDashboardComponent]
})
export class SiDashboardModule {}
