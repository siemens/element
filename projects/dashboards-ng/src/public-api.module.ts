/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';

import { SiFlexibleDashboardComponent } from './components/flexible-dashboard/si-flexible-dashboard.component';
import { SiGridComponent } from './components/grid/si-grid.component';
import { SiWidgetCatalogComponent } from './components/widget-catalog/si-widget-catalog.component';
import { SiWidgetInstanceEditorDialogComponent } from './components/widget-instance-editor-dialog/si-widget-instance-editor-dialog.component';
import { Config, SI_DASHBOARD_CONFIGURATION } from './model/configuration';
import {
  SI_WIDGET_STORE,
  SiDefaultWidgetStorage,
  SiWidgetStorage
} from './model/si-widget-storage';

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
export class SiDashboardsNgModule {
  /**
   * @deprecated The module configuration `forRoot` is not needed any more. You can use the injection tokens
   * `SI_DASHBOARD_CONFIGURATION` and `SI_WIDGET_STORE` direct in your app configuration. We migrated to standalone
   * components already and will delete this module definition later.
   */
  static forRoot({
    config,
    dashboardApi
  }: {
    config?: Config;
    /**
     * Provide a custom widget storage.
     *
     * @deprecated Use the provider tokens in your app config instead.
     *
     * @example
     * ```typescript
     * const appConfig: ApplicationConfig = {
     *  providers: [{provide: SI_WIDGET_STORE, useClass: YourWidgetStorage}]
     * }
     * ```
     */
    dashboardApi?: Provider;
  }): ModuleWithProviders<SiDashboardsNgModule> {
    return {
      ngModule: SiDashboardsNgModule,
      providers: [
        {
          provide: SI_DASHBOARD_CONFIGURATION,
          useValue: config
        },
        dashboardApi ?? {
          provide: SiWidgetStorage,
          useClass: SiDefaultWidgetStorage
        },
        dashboardApi ? { provide: SI_WIDGET_STORE, useExisting: SiWidgetStorage } : []
      ]
    };
  }
}

export { SiDashboardsNgModule as SimplDashboardsNgModule };
