/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideSiUiState } from '@siemens/element-ng/common';
import { provideSiDatatableConfig } from '@siemens/element-ng/datatable';
import { provideNgxTranslateForElement, provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';
import { LOG_EVENT } from '@siemens/live-preview';

import { AppComponent } from './app/app.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      missingTranslationHandler: provideMissingTranslationHandlerForElement()
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter([]),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxTranslateForElement(),
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
