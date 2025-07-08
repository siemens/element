/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/// <reference types="node" />
// only link node types here to prevent them from being used in other files

import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  Injectable,
  LOCALE_ID,
  provideAppInitializer,
  ɵLocaleDataIndex
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideSiDatatableConfig } from '@siemens/element-ng/datatable';
import { SiFormlyModule } from '@siemens/element-ng/formly';
import { provideIconConfig } from '@siemens/element-ng/icon';
import {
  SI_LOCALE_CONFIG,
  SiLocaleConfig,
  SiLocaleId,
  SiLocaleService
} from '@siemens/element-ng/localization';
import { provideNgxTranslateForElement } from '@siemens/element-translate-ng/ngx-translate';
import {
  SiLivePreviewLocaleApi,
  SiLivePreviewThemeApi,
  SiLivePreviewModule,
  SiLivePreviewRoutingModule
} from '@siemens/live-preview';
import { lastValueFrom, Observable, take } from 'rxjs';

import { FileUploadInterceptor } from './examples/si-file-uploader/file-upload-interceptor';
import { CustomWrapperComponent } from './examples/si-formly/dynamic-form-custom-wrapper';
import { LivePreviewThemeApiService } from './shared/live-preview-theme.api.service';
import { WebpackTranslateLoader } from './webpack-translate-loader';

const componentLoader =
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  require('@siemens/live-preview/component-loader?root=src&examples=app/examples/**/*.ts&webcomponents=true!./app.config').default;

// On locale change, we dynamically reload the locale definition
// for angular. With this configuration, we only load the current
// locale into the client and not all application locales.
// As loading of the locale package is asynchronous, we need to ensure
// the package is loaded before the app is bootstrapping and rendering.
// For that, we are using Angular's APP_INITIALIZER mechanism and wait
// until localePackageLoaded$ emits and indicates the locale package is
// loaded.
const locales: Record<string, any> = {
  'en': () => import('@angular/common/locales/en'),
  'el': () => import('@angular/common/locales/el'),
  'de': () => import('@angular/common/locales/de'),
  'fr': () => import('@angular/common/locales/fr')
};

const genericLocaleInitializer = (localeId: string): Promise<any> => {
  return locales[localeId]!().then((module: any) => {
    if (localStorage.getItem('date-pattern.enable') !== 'true') {
      registerLocaleData(module.default);
    } else {
      const localeFormats = module.default;
      const datePattern = localStorage.getItem('date-pattern') ?? '';
      const shortDateIndex = 0;
      localeFormats[ɵLocaleDataIndex.DateFormat][shortDateIndex] = datePattern;
      registerLocaleData(localeFormats);
    }
  });
};

const localeConfig: SiLocaleConfig = {
  availableLocales: ['en', 'el', 'de', 'fr'],
  defaultLocale: 'en',
  localeInitializer: genericLocaleInitializer,
  dynamicLanguageChange: false,
  fallbackEnabled: false
};

@Injectable()
class LivePreviewLocaleApiService extends SiLivePreviewLocaleApi {
  private localeService = inject(SiLocaleService);

  setLocale(locale: string): void {
    this.localeService.locale = locale;
  }

  getLocale(): Observable<string> {
    return this.localeService.locale$;
  }

  availableLocales(): string[] {
    return this.localeService.config.availableLocales ?? ['en'];
  }
}

export const appInitializerFactory =
  (localeService: SiLocaleService): (() => Promise<any>) =>
  () =>
    lastValueFrom(localeService.localePackageLoaded$.pipe(take(1)));

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      // Npm dependencies
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: WebpackTranslateLoader
        }
      }),
      SiLivePreviewRoutingModule,
      // App internal
      SiLivePreviewModule.forRoot(
        {
          modules: [
            SiFormlyModule.forRoot({
              wrappers: [
                {
                  name: 'custom-wrapper',
                  component: CustomWrapperComponent
                }
              ],
              extras: {
                resetFieldOnHide: false
              }
            })
          ],
          componentLoader,
          examplesBaseUrl: 'app/examples/',
          ticketBaseUrl: 'https://github.com/siemens/element/issues/new',
          themeSwitcher: true,
          rtlSwitcher: true,
          webcomponents: true
        },
        false
      )
    ),
    provideAppInitializer(() => {
      const initializerFn = appInitializerFactory(inject(SiLocaleService));
      return initializerFn();
    }),
    { provide: LOCALE_ID, useClass: SiLocaleId, deps: [SiLocaleService] },
    { provide: SI_LOCALE_CONFIG, useValue: localeConfig },
    { provide: SiLivePreviewThemeApi, useClass: LivePreviewThemeApiService },
    { provide: SiLivePreviewLocaleApi, useClass: LivePreviewLocaleApiService },
    { provide: HTTP_INTERCEPTORS, useExisting: FileUploadInterceptor, multi: true },
    provideAnimationsAsync(navigator.webdriver ? 'noop' : 'animations'),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxTranslateForElement(),
    provideSiDatatableConfig(),
    provideIconConfig({ disableSvgIcons: false })
  ]
};
