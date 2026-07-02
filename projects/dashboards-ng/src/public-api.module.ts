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

/**
 * @deprecated Use {@link SiDashboardsNgModule} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SimplDashboardsNgModule = SiDashboardsNgModule;

/**
 * @deprecated Use {@link SiDashboardsNgModule} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
export type SimplDashboardsNgModule = SiDashboardsNgModule;
