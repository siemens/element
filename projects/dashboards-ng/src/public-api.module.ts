/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiFlexibleDashboardComponent } from './components/flexible-dashboard/si-flexible-dashboard.component';
import { SiGridComponent } from './components/grid/si-grid.component';
import { SiWidgetCatalogComponent } from './components/widget-catalog/si-widget-catalog.component';
import { SiWidgetInstanceEditorDialogComponent } from './components/widget-instance-editor-dialog/si-widget-instance-editor-dialog.component';

@NgModule({
  imports: [
    SiFlexibleDashboardComponent,
    SiGridComponent,
    SiWidgetCatalogComponent,
    SiWidgetInstanceEditorDialogComponent
  ],
  exports: [
    SiFlexibleDashboardComponent,
    SiGridComponent,
    SiWidgetCatalogComponent,
    SiWidgetInstanceEditorDialogComponent
  ]
})
export class SiDashboardsNgModule {}

export { SiDashboardsNgModule as SimplDashboardsNgModule };
