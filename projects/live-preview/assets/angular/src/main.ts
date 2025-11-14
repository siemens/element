/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideSiUiState } from '@siemens/element-ng/common';
import { provideSiDatatableConfig } from '@siemens/element-ng/datatable';
import { provideIconConfig } from '@siemens/element-ng/icon';
import { provideNgxTranslateForElement } from '@siemens/element-translate-ng/ngx-translate';
import { LOG_EVENT } from '@siemens/live-preview';

import { AppComponent } from './app/app.component';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      // Npm dependencies
      TranslateModule.forRoot()
    ),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([]),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxTranslateForElement(),
    provideIconConfig({ disableSvgIcons: false }),
    provideSiDatatableConfig(),
    provideSiUiState(),
    {
      provide: LOG_EVENT,
      // eslint-disable-next-line no-console
      useValue: (...msg: any[]) => console.log(msg)
    }
  ]
};

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
