/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  Config,
  provideDashboardToolbarItems,
  SI_DASHBOARD_CONFIGURATION,
  SI_WIDGET_ID_PROVIDER,
  SI_WIDGET_STORE
} from '@siemens/dashboards-ng';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';

import { AppWidgetIdProvider } from './app-widget-id-provider';
import { AppWidgetStorage } from './app-widget-storage';
import { routes } from './app.routes';

const config: Config = {
  grid: {
    gridStackOptions: {
      column: 12
    }
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    { provide: SI_WIDGET_STORE, useClass: AppWidgetStorage },
    { provide: SI_DASHBOARD_CONFIGURATION, useValue: config },
    { provide: SI_WIDGET_ID_PROVIDER, useClass: AppWidgetIdProvider },
    provideTranslateService({
      missingTranslationHandler: provideMissingTranslationHandlerForElement(),
      loader: provideTranslateHttpLoader({
        resources: ['./assets/i18n/', './assets/i18n/dashboards-ng/']
      })
    }),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxTranslateForElement(),
    provideDashboardToolbarItems({
      // provide common toolbar action items here
      primary: [],
      secondary: []
    })
  ]
};
