/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HttpBackend, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  Config,
  SI_DASHBOARD_CONFIGURATION,
  SI_WIDGET_ID_PROVIDER,
  SI_WIDGET_STORE
} from '@siemens/dashboards-ng';
import { provideNgxTranslateForElement } from '@siemens/element-translate-ng/ngx-translate';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { AppWidgetIdProvider } from './app-widget-id-provider';
import { AppWidgetStorage } from './app-widget-storage';
import { routes } from './app.routes';

export const createTranslateLoader = (http: HttpBackend): MultiTranslateHttpLoader =>
  new MultiTranslateHttpLoader(http, ['./assets/i18n/', './assets/i18n/dashboards-ng/']);

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
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpBackend]
        }
      })
    ),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxTranslateForElement(),
    provideZoneChangeDetection()
  ]
};
