/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import {
  getBrowserCultureLanguage,
  getBrowserLanguage,
  injectSiTranslateService
} from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { SiDefaultLocaleStore, SiLocaleStore } from './si-locale-store';

export const SI_LOCALE_STORE = new InjectionToken<string>('SI_LOCALE_STORE');
export const SI_LOCALE_CONFIG = new InjectionToken<SiLocaleConfig>('SI_LOCALE_CONFIG');

// this is a function because Angular compiler exports arrows for no good reason
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function defaultLocaleInitializer(localeId: string): Promise<void> {
  if (localeId === 'en') {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
}

export interface SiLocaleConfig {
  /**
   * The default locale to be used, when no user preference
   * available and the browser language is not part of the
   * available languages.
   */
  defaultLocale?: string;
  /**
   * The list of available locales (e.g. en, fr, de, en-GB, de-AT)
   */
  availableLocales?: string[];
  /**
   * The localeInitializer function is invoked on every locale change.
   * Make sure to invoke `registerLocaleData` with the locale to enable
   * the Angular localization.
   */
  localeInitializer?: (localeId: string) => Promise<any>;
  /**
   * Set to true to also enable the default language on ngx-translate. When true,
   * ngx-translate will use a translate value from the default language when a required
   * value is not available in the current language. But note, this will also enforce
   * to load the default language translation file into the application, even if a different
   * locale is active. In other words, the application start time increases.
   */
  fallbackEnabled?: boolean;
  /**
   * Default is false and defines that on setting a new locale, the locale is stored and the
   * browser is reloaded. When changing to true, window reload is not invoked, but angular
   * pure pipes like DatePipe will not work.
   */
  dynamicLanguageChange?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SiLocaleService {
  /**
   * Holds the used locale definition like en, de, or en-US.
   */
  readonly locale$: BehaviorSubject<string>;
  /**
   * Emits to indicate that the localization package (e.g. \@angular/common/locales/$\{localeId\})
   * is loaded and registered. Emits after calling `localeInitializer` from the `config` object.
   */
  readonly localePackageLoaded$ = new ReplaySubject<void>(1);

  private _nextLocale!: string;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private translate = injectSiTranslateService();
  private localeStore =
    inject(SiLocaleStore, { optional: true }) ?? new SiDefaultLocaleStore(this.isBrowser);
  /**
   * The config for the local service.
   */
  config = inject(SI_LOCALE_CONFIG, { optional: true }) ?? {
    availableLocales: ['en'],
    defaultLocale: 'en',
    localeInitializer: defaultLocaleInitializer,
    fallbackEnabled: false,
    dynamicLanguageChange: false
  };

  constructor() {
    if (!this.config.defaultLocale) {
      if (this.config.availableLocales && this.config.availableLocales.length > 0) {
        this.config.defaultLocale = this.config.availableLocales[0];
      } else {
        this.config.defaultLocale = 'en';
      }
    }

    if (!this.config.availableLocales || this.config.availableLocales.length === 0) {
      this.config.availableLocales = [this.config.defaultLocale];
    }
    // Also adds all locales to the translate service to enable
    // components working with the translate service directly to still work.
    this.translate.availableLanguages = this.config.availableLocales;

    this.config.localeInitializer ??= defaultLocaleInitializer;
    this.config.fallbackEnabled ??= false;
    this.config.dynamicLanguageChange ??= false;

    const savedLocale = this.localeStore.locale;
    // The following check is important. We do not control the store and when it comes from
    // a remove backend, someone might give us a locale that we do not understand. In this
    // case we switch to the default.
    let initialLocale;
    const browserCultureLang = getBrowserCultureLanguage();
    const browserLang = getBrowserLanguage();
    if (this.hasLocale(savedLocale)) {
      initialLocale = savedLocale!;
    } else if (this.translate.currentLanguage) {
      initialLocale = this.translate.currentLanguage;
    } else if (this.hasLocale(browserCultureLang)) {
      initialLocale = browserCultureLang!;
    } else if (this.hasLocale(browserLang)) {
      initialLocale = browserLang!;
    } else {
      initialLocale = this.config.defaultLocale;
    }
    this.locale$ = new BehaviorSubject<string>(initialLocale);
    this.doSetLocale(initialLocale);

    // If a user changes the language on the translate service directly,
    // we synchronize the change again.
    this.translate.translationChange.subscribe(() => {
      this.locale = this.translate.currentLanguage;
    });

    if (this.config.fallbackEnabled) {
      this.translate.setDefaultLanguage(this.config.defaultLocale);
    }
  }

  /**
   * Sets a new locale to the locale service and also to the translate
   * service.
   * @throws An error if the new value is not configured in the available locales
   * or if the new locale cannot be saved, an error is thrown.
   */
  set locale(value: string) {
    if (value === this.locale$.value || value === this._nextLocale) {
      return;
    }
    if (!this.hasLocale(value)) {
      throw new Error(`The value ${value} does not exist in the available locales.`);
    }
    this.localeStore
      .saveLocale(value)
      .pipe(first())
      .subscribe({
        next: (saveSucceed: boolean) => {
          if (saveSucceed) {
            if (this.config.dynamicLanguageChange) {
              this.doSetLocale(value);
            } else if (this.isBrowser) {
              window.location.reload();
            }
          } else {
            throw new Error(`Could not save new locale ${value}.`);
          }
        },
        error: () => {
          throw new Error(`Could not save new locale ${value}.`);
        }
      });
  }

  get locale(): string {
    return this.locale$.value;
  }

  private doSetLocale(value: string): void {
    this._nextLocale = value;
    this.config.localeInitializer!(value).then(
      () => {
        this.localePackageLoaded$.next();
        this.translate
          .setCurrentLanguage(value)
          .pipe(first())
          .subscribe(() => {
            if (this.locale$.value !== value) {
              this.locale$.next(value);
            }
          });
      },
      () => {
        console.error(
          `Could not initialize new locale ${value}. Setting default locale ${this.config.defaultLocale}`
        );
        // Initialization of locale rejected. Setting default locale.
        this.translate
          .setCurrentLanguage(this.config.defaultLocale!)
          .pipe(first())
          .subscribe(() => {
            if (this.locale$.value !== this.config.defaultLocale!) {
              this.locale$.next(this.config.defaultLocale!);
            }
          });
      }
    );
  }

  /**
   * Test if the given locale is part of the available locales.
   * @param locale - The locale to be tested.
   */
  hasLocale(locale?: string): boolean {
    if (locale) {
      return this.config.availableLocales!.includes(locale);
    }
    return false;
  }
}
