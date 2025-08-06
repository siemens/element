/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, DOCUMENT, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SiTranslateNgxTService } from '@siemens/element-translate-ng/ngx-translate/si-translate-ngxt.service';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { Observable, of, Subject } from 'rxjs';

import { SiTranslateNgxTModule } from './si-translate-ngxt.module';

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

describe('SiTranslateNgxT', () => {
  describe('with multiple translation services', () => {
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
      const fixture = TestBed.createComponent(HostComponent);
      await RouterTestingHarness.create('/');
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).innerText).toBe('VALUE-MODIFIED');
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

      it('should translate', (done: DoneFn) => {
        (service.translate('KEY-1') as Observable<string>).subscribe(value => {
          expect(value).toBe('VALUE-1');
          done();
        });
      });

      it('should translate multiple keys', (done: DoneFn) => {
        (service.translate(['KEY-1', 'KEY-3']) as Observable<Record<string, string>>).subscribe(
          value => {
            expect(value).toEqual({ 'KEY-1': 'VALUE-1', 'KEY-3': 'VALUE-3' });
            done();
          }
        );
      });

      it('should translate no keys', (done: DoneFn) => {
        (service.translate([]) as Observable<Record<string, string>>).subscribe(value => {
          expect(value).toEqual({});
          done();
        });
      });

      it('should translate async', (done: DoneFn) => {
        service.translateAsync('KEY-2').subscribe(value => {
          expect(value).toBe('VALUE-2');
          done();
        });
      });

      it('should translate async multiple keys', (done: DoneFn) => {
        (
          service.translateAsync(['KEY-1', 'KEY-3']) as Observable<Record<string, string>>
        ).subscribe(value => {
          expect(value).toEqual({ 'KEY-1': 'VALUE-1', 'KEY-3': 'VALUE-3' });
          done();
        });
      });

      it('should translate async no keys', (done: DoneFn) => {
        (service.translateAsync([]) as Observable<Record<string, string>>).subscribe(value => {
          expect(value).toEqual({});
          done();
        });
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

      it('should use correct language', (done: DoneFn) => {
        expect(service.availableLanguages).toEqual(['test']);
        expect(service.currentLanguage).toBe('test');
        service.setCurrentLanguage('test').subscribe(() => {
          expect(service.currentLanguage).toBe('test');
          done();
        });
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

      it('should set html lang attribute', (done: DoneFn) => {
        const documentRef = TestBed.inject(DOCUMENT);
        service.availableLanguages = ['test', 'another'];
        service.setCurrentLanguage('test').subscribe(() => {
          expect(documentRef.documentElement.getAttribute('lang')).toBe('test');
          done();
        });
      });
    });
  });
});
