/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, DOCUMENT, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  provideTranslateService,
  TranslateLoader,
  TranslateModule,
  TranslateService,
  Translation
} from '@ngx-translate/core';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';

import { SiTranslateNgxTModule } from './si-translate-ngxt.module';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from './si-translate-ngxt.provider';
import { SiTranslateNgxTService } from './si-translate-ngxt.service';

@Injectable()
class RootTestService {
  siTranslateService = injectSiTranslateService();
}

@Component({
  imports: [SiTranslateNgxTModule, RouterOutlet],
  template: `<router-outlet />`
})
class HostComponent {}

@Component({
  imports: [SiTranslatePipe],
  template: `{{ missingKey | translate }}-{{ existingKey | translate }}`
})
class TestWithDefaultHostComponent {
  missingKey = t(() => $localize`:@@KEY-MISSING:VALUE-MISSING-FALLBACK`);
  existingKey = t(() => $localize`:@@KEY-EXISTING:VALUE-EXISTING-FALLBACK`);
}

@Injectable()
class MissingTranslation implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): Translation | Observable<Translation> {
    return `APP-${params.key}`;
  }
}

describe('SiTranslateNgxT', () => {
  describe('with multiple translation services', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          SiTranslateNgxTModule,
          TranslateModule.forRoot({
            defaultLanguage: 'test',
            useDefaultLang: true,
            missingTranslationHandler: provideMissingTranslationHandlerForElement(),
            loader: {
              provide: TranslateLoader,
              useValue: {
                getTranslation: () =>
                  of({
                    'KEY-1': 'VALUE-1',
                    'KEY-2': 'VALUE-2',
                    'KEY-3': 'VALUE-3'
                  })
              } as TranslateLoader
            }
          }),
          RouterModule.forRoot([
            {
              path: '',
              loadChildren: () =>
                import('./si-translate-ngxt.test-module.spec').then(m => m.TestModule)
            }
          ]),
          HostComponent
        ],
        providers: [RootTestService]
      });
    });

    it('should use correct translation service', async () => {
      const router = await RouterTestingHarness.create('/');
      expect((router.routeNativeElement as HTMLElement).innerText).toBe('VALUE-MODIFIED');
      expect(TestBed.inject(RootTestService).siTranslateService.translateSync('KEY-1')).toBe(
        'VALUE-1'
      );
      expect(
        TestBed.inject(RootTestService).siTranslateService.translateSync(['KEY-1', 'KEY-2'])
      ).toEqual({ 'KEY-1': 'VALUE-1', 'KEY-2': 'VALUE-2' });
    });
  });

  describe('with single translation service', () => {
    let service: SiTranslateNgxTService;
    let translateLoader$ = new Subject<Record<string, any>>();

    beforeEach(() => {
      translateLoader$ = new Subject();
      TestBed.configureTestingModule({
        imports: [
          SiTranslateNgxTModule,
          TranslateModule.forRoot({
            defaultLanguage: 'test',
            useDefaultLang: true,
            missingTranslationHandler: provideMissingTranslationHandlerForElement(),
            loader: {
              provide: TranslateLoader,
              useValue: {
                getTranslation: () => translateLoader$.asObservable()
              } as TranslateLoader
            }
          })
        ]
      });
    });
    beforeEach(() => {
      service = TestBed.runInInjectionContext(() =>
        injectSiTranslateService()
      ) as SiTranslateNgxTService;
      service.setCurrentLanguage('test');
    });

    it('should resolve $localize values properly', () => {
      const fixture = TestBed.createComponent(TestWithDefaultHostComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).innerText).toBe(`-`);
      translateLoader$.next({ 'KEY-EXISTING': 'VALUE-EXISTING' });
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).innerText).toBe(
        `VALUE-MISSING-FALLBACK-VALUE-EXISTING`
      );
    });

    it('should set translation and preserve it', () => {
      service.setTranslation('KEY-1', 'default-value');
      service.setTranslation('KEY-2', 'default-value');
      translateLoader$.next({ 'KEY-1': 'VALUE-1' });
      expect(service.translateSync('KEY-1')).toBe('VALUE-1');
      expect(service.translateSync('KEY-2')).toBe('default-value');
      service.setCurrentLanguage('test-2');
      translateLoader$.next({ 'KEY-1': 'VALUE-2' });
      expect(service.translateSync('KEY-1')).toBe('VALUE-2');
      expect(service.translateSync('KEY-2')).toBe('default-value');
    });

    describe('with loaded translations', () => {
      beforeEach(() => {
        translateLoader$.next({
          'KEY-1': 'VALUE-1',
          'KEY-2': 'VALUE-2',
          'KEY-3': 'VALUE-3'
        });
      });

      it('should translate', async () => {
        const value = await firstValueFrom(service.translate('KEY-1') as Observable<string>);
        expect(value).toBe('VALUE-1');
      });

      it('should translate multiple keys', async () => {
        const value = await firstValueFrom(
          service.translate(['KEY-1', 'KEY-3']) as Observable<Record<string, string>>
        );
        expect(value).toEqual({ 'KEY-1': 'VALUE-1', 'KEY-3': 'VALUE-3' });
      });

      it('should translate no keys', async () => {
        const value = await firstValueFrom(
          service.translate([]) as Observable<Record<string, string>>
        );
        expect(value).toEqual({});
      });

      it('should translate async', async () => {
        const value = await firstValueFrom(service.translateAsync('KEY-2') as Observable<string>);
        expect(value).toBe('VALUE-2');
      });

      it('should translate async multiple keys', async () => {
        const value = await firstValueFrom(
          service.translateAsync(['KEY-1', 'KEY-3']) as Observable<Record<string, string>>
        );
        expect(value).toEqual({ 'KEY-1': 'VALUE-1', 'KEY-3': 'VALUE-3' });
      });

      it('should translate async no keys', async () => {
        const value = await firstValueFrom(
          service.translateAsync([]) as Observable<Record<string, string>>
        );
        expect(value).toEqual({});
      });

      it('should translate sync', () => {
        expect(service.translateSync('KEY-3')).toBe('VALUE-3');
      });

      it('should translate sync multiple keys', () => {
        expect(service.translateSync(['KEY-1', 'KEY-3'])).toEqual({
          'KEY-1': 'VALUE-1',
          'KEY-3': 'VALUE-3'
        });
      });

      it('should translate sync no keys', () => {
        expect(service.translateSync([])).toEqual({});
      });

      it('should use correct language', async () => {
        expect(service.availableLanguages).toEqual(['test']);
        expect(service.currentLanguage).toBe('test');
        await firstValueFrom(service.setCurrentLanguage('test'));
        expect(service.currentLanguage).toBe('test');
      });

      it('should set default language', () => {
        expect(service.getDefaultLanguage()).toBe('test');
        service.setDefaultLanguage('another');
        translateLoader$.next({});
        expect(service.getDefaultLanguage()).toBe('another');
      });

      it('should set available languages', () => {
        expect(service.availableLanguages).toEqual(['test']);
        service.availableLanguages = ['test', 'another'];
        expect(service.availableLanguages).toEqual(['test', 'another']);
      });

      it('should set html lang attribute', async () => {
        const documentRef = TestBed.inject(DOCUMENT);
        service.availableLanguages = ['test', 'another'];
        await firstValueFrom(service.setCurrentLanguage('test'));
        expect(documentRef.documentElement.getAttribute('lang')).toBe('test');
      });
    });
  });

  describe('without missing translation service', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          SiTranslateNgxTModule,
          TranslateModule.forRoot({
            defaultLanguage: 'test',
            useDefaultLang: true,
            loader: {
              provide: TranslateLoader,
              useValue: {
                getTranslation: () => of({})
              } as TranslateLoader
            }
          })
        ]
      });
    });

    it('should warn about missing SiMissingTranslateService', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      TestBed.runInInjectionContext(() => injectSiTranslateService()) as SiTranslateNgxTService;
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SiMissingTranslateService not provided as missingTranslateHandler, default translations will not work.'
      );
    });
  });

  describe('with appMissingTranslationHandler', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideNgxTranslateForElement(),
          provideTranslateService({
            defaultLanguage: 'test',
            useDefaultLang: true,
            missingTranslationHandler: provideMissingTranslationHandlerForElement({
              provide: MissingTranslationHandler,
              useClass: MissingTranslation
            }),
            loader: {
              provide: TranslateLoader,
              useValue: {
                getTranslation: () =>
                  of({
                    'KEY-1': 'VALUE-1',
                    'KEY-2': 'VALUE-2',
                    'KEY-3': 'VALUE-3'
                  })
              } as TranslateLoader
            }
          })
        ]
      });
    });

    it('should call app missing translation handler', async () => {
      const translateService = TestBed.inject(TranslateService);
      expect(translateService.instant('MISSING')).toBe('APP-MISSING');
    });
  });
});
