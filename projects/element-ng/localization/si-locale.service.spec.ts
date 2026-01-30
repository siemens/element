/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SiTranslateNgxTModule } from '@siemens/element-translate-ng/ngx-translate';
import { firstValueFrom, Observable, of, take, toArray } from 'rxjs';

import { SiLocaleStore } from './si-locale-store';
import { SI_LOCALE_CONFIG, SiLocaleConfig, SiLocaleService } from './si-locale.service';

class NoLocaleStore extends SiLocaleStore {
  get locale(): string | undefined {
    return undefined;
  }

  saveLocale(locale: string): Observable<boolean> {
    return of(true);
  }
}

class DeLocaleStore extends SiLocaleStore {
  get locale(): string | undefined {
    return 'de';
  }

  saveLocale(locale: string): Observable<boolean> {
    return of(true);
  }
}

describe('SiLocaleService', () => {
  let service: SiLocaleService;
  Object.defineProperty(navigator, 'languages', { value: ['en-GB', 'en-US'] });

  describe('with empty configuration', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SiTranslateNgxTModule, TranslateModule.forRoot()]
      });
      service = TestBed.inject(SiLocaleService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return en locale when nothing else is configured', () => {
      expect(service.locale).toBe('en');
    });

    it('should have a complete configuration without any input', () => {
      expect(service.config.availableLocales).toBeDefined();
      expect(service.config.availableLocales!.length).toBe(1);
      expect(service.config.availableLocales![0]).toBe('en');
      expect(service.config.defaultLocale).toBe('en');
      expect(service.config.dynamicLanguageChange).toBeFalse();
      expect(service.config.fallbackEnabled).toBeFalse();
      expect(service.config.localeInitializer).toBeDefined();
    });

    it('should have a default locale initializer resolves on en', async () => {
      expect(service.config.localeInitializer).toBeDefined();
      await service.config.localeInitializer!('en');
    });
  });

  it('should setup default locale to first from available locales', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['fr', 'de', 'en']
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.config.defaultLocale).toBe('fr');
  });

  it('should setup default locale to en on default', () => {
    const config: SiLocaleConfig = {};

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.config.defaultLocale).toBe('en');
  });

  it('should add default locale to available locales', () => {
    const config: SiLocaleConfig = {
      availableLocales: []
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.config.availableLocales![0]).toBe('en');
  });

  it('should add available locales to translate service', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['en', 'de', 'fr']
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    const translate = TestBed.inject(TranslateService);
    expect(translate.getLangs().length).toBe(3);
    expect(translate.getLangs()[2]).toBe('fr');
  });

  it('should setup default language on translate service, when fallbackLanguage is enabled', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['en', 'de', 'fr'],
      defaultLocale: 'fr',
      fallbackEnabled: true
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    const translate = TestBed.inject(TranslateService);
    expect(translate.getDefaultLang()).toBe('fr');
  });

  it('should use browser language, when part of available languages and no language is stored', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['en', 'de', 'fr'],
      defaultLocale: 'fr',
      fallbackEnabled: true
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.locale$.value).toBe('en');
  });

  it('hasLocale shall return true on match', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['en', 'de', 'fr'],
      defaultLocale: 'fr',
      fallbackEnabled: true
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [{ provide: SI_LOCALE_CONFIG, useValue: config }]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.hasLocale('de')).toBeTrue();
    expect(service.hasLocale('dex')).toBeFalse();
    expect(service.hasLocale('')).toBeFalse();
    expect(service.hasLocale()).toBeFalse();
    expect(service.hasLocale(undefined)).toBeFalse();
  });

  describe('with default configuration', () => {
    let translate: TranslateService;

    beforeEach(() => {
      const config: SiLocaleConfig = {
        availableLocales: ['en', 'de', 'fr'],
        defaultLocale: 'fr',
        fallbackEnabled: true,
        dynamicLanguageChange: true,
        localeInitializer: (localeId: string) => Promise.resolve()
      };

      TestBed.configureTestingModule({
        imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
        providers: [
          { provide: SI_LOCALE_CONFIG, useValue: config },
          { provide: SiLocaleStore, useClass: NoLocaleStore }
        ]
      });

      service = TestBed.inject(SiLocaleService);
      translate = TestBed.inject(TranslateService);
    });

    it('should change the locale at translate service', async () => {
      const firstEvent = await firstValueFrom(translate.onLangChange);
      // the initial browser locale
      expect(firstEvent.lang).toBe('en');

      const secondEventPromise = firstValueFrom(translate.onLangChange);
      service.locale = 'de';

      // after the change
      const secondEvent = await secondEventPromise;
      expect(secondEvent.lang).toBe('de');
    });

    it('should change the locale following the translate service changes', async () => {
      const localePromise = firstValueFrom(service.locale$.pipe(take(2), toArray()));

      // wait for initial lang change to be processed
      await firstValueFrom(translate.onLangChange);
      translate.use('de');

      const locales = await localePromise;
      // the initial default locale
      expect(locales[0]).toBe('en');
      // after the change
      expect(locales[1]).toBe('de');
    });

    it('should throw an error when setting an unknown locale', () => {
      expect(() => (service.locale = 'example-value')).toThrowError(
        'The value example-value does not exist in the available locales.'
      );
    });
  });

  it('shall use the saved locale initially if part of available locales', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['en', 'de', 'fr'],
      defaultLocale: 'fr',
      localeInitializer: (localeId: string) => Promise.resolve()
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [
        { provide: SI_LOCALE_CONFIG, useValue: config },
        { provide: SiLocaleStore, useClass: DeLocaleStore }
      ]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.locale).toBe('de');
  });

  it('shall use the default locale initially if the saved locale and browser lang are not part of available locales', () => {
    const config: SiLocaleConfig = {
      availableLocales: ['es', 'fr'],
      defaultLocale: 'fr',
      localeInitializer: (localeId: string) => Promise.resolve()
    };
    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [
        { provide: SI_LOCALE_CONFIG, useValue: config },
        { provide: SiLocaleStore, useClass: DeLocaleStore }
      ]
    });
    service = TestBed.inject(SiLocaleService);
    expect(service.locale).toBe('fr');
  });

  it('shall use the default locale if new locale is not supported by localeInitializer', async () => {
    const config: SiLocaleConfig = {
      availableLocales: ['de', 'fr', 'en'],
      defaultLocale: 'fr',
      dynamicLanguageChange: true,
      localeInitializer: (localeId: string) => {
        if (localeId === 'de') {
          return Promise.resolve();
        } else {
          return Promise.reject();
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot()],
      providers: [
        { provide: SI_LOCALE_CONFIG, useValue: config },
        { provide: SiLocaleStore, useClass: DeLocaleStore }
      ]
    });
    service = TestBed.inject(SiLocaleService);

    const localePromise = firstValueFrom(service.locale$.pipe(take(2), toArray()));

    service.locale = 'en';

    const locales = await localePromise;
    // the initial default locale
    expect(locales[0]).toBe('de');
    // after setting the locale to en, which is not supported by
    // the localeInitializer the default locale should be set
    expect(locales[1]).toBe('fr');
  });
});
