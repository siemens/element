/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injectable
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SiTranslatePipe } from './si-translate.pipe';
import { SiTranslateService, TranslationResult } from './si-translate.service';
import { provideMockTranslateServiceBuilder } from './testing/si-translate.mock-service-builder.factory';

@Component({
  imports: [SiTranslatePipe],
  template: `{{ toTranslateKey | translate: params }}`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  toTranslateKey = $localize`:@@KEY:Test {{value}}`;
  params = { value: 'string' } as any;
  cdRef = inject(ChangeDetectorRef);
}

@Injectable({ providedIn: 'root' })
class SiAsyncTranslateService extends SiTranslateService {
  translationPrefixer = new BehaviorSubject<TranslationResult<string>>('translated');

  override get currentLanguage(): string {
    return 'en';
  }

  override get availableLanguages(): string[] {
    return ['en'];
  }

  override setCurrentLanguage(lang: string): Observable<void> {
    return of();
  }

  override getDefaultLanguage(): string {
    return 'en';
  }

  override setDefaultLanguage(lang: string): void {}

  override translate<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): Observable<TranslationResult<T>> {
    // "as any" due to Typescript not being able to handle type guards in combination with generics
    return this.translationPrefixer.pipe(
      map(prefix => `${prefix}=>${keys}-${JSON.stringify(params)}`)
    ) as any;
  }

  override translateAsync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown> | undefined
  ): Observable<TranslationResult<T>> {
    return this.translate(keys, params);
  }

  override translateSync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): TranslationResult<T> {
    // "as any" due to Typescript not being able to handle type guards in combination with generics
    return 'test' as any;
  }
}

describe('SiTranslatePipe', () => {
  describe('with async translations', () => {
    let translateService: SiAsyncTranslateService;
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let nativeElement: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestComponent],
        providers: [
          provideMockTranslateServiceBuilder(injector => injector.get(SiAsyncTranslateService))
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      translateService = TestBed.runInInjectionContext(() =>
        injectSiTranslateService()
      ) as SiAsyncTranslateService;
      nativeElement = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('should translate different keys', () => {
      expect(nativeElement.innerText).toBe('translated=>KEY-{"value":"string"}');
      component.toTranslateKey = 'OTHER_KEY';
      component.cdRef.detectChanges();
      expect(nativeElement.innerText).toBe('translated=>OTHER_KEY-{"value":"string"}');
    });

    it('should translate different values', () => {
      expect(nativeElement.innerText).toBe('translated=>KEY-{"value":"string"}');
      translateService.translationPrefixer.next('other_translated');
      fixture.detectChanges();
      expect(nativeElement.innerText).toBe('other_translated=>KEY-{"value":"string"}');
    });

    it('should not call translate when no param changed', () => {
      const pipeSpy = spyOn(SiTranslatePipe.prototype, 'transform');
      const translateSpy = spyOn(SiAsyncTranslateService.prototype, 'translate');
      component.cdRef.detectChanges();
      expect(pipeSpy).toHaveBeenCalled();
      expect(translateSpy).not.toHaveBeenCalled();
    });
  });

  describe('with synchronous translation', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let nativeElement: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestComponent],
        providers: [
          provideMockTranslateServiceBuilder(
            () =>
              ({
                translate: (key: string, params: Record<string, any>) =>
                  `translated=>${key}-${JSON.stringify(params)}`
              }) as SiTranslateService
          )
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      nativeElement = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('should translate different keys', () => {
      expect(nativeElement.innerText).toBe('translated=>KEY-{"value":"string"}');
      component.toTranslateKey = 'OTHER_KEY';
      component.cdRef.detectChanges();
      expect(nativeElement.innerText).toBe('translated=>OTHER_KEY-{"value":"string"}');
    });

    it('should translate different params', () => {
      expect(nativeElement.innerText).toBe('translated=>KEY-{"value":"string"}');
      component.params.otherValue = 'otherString';
      component.cdRef.detectChanges();
      expect(nativeElement.innerText).toBe(
        'translated=>KEY-{"value":"string","otherValue":"otherString"}'
      );
    });
  });

  describe('with no translate', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let nativeElement: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestComponent]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      nativeElement = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('should replace placeholders with param value', () => {
      expect(nativeElement.innerText).toBe('Test string');
      component.toTranslateKey = '{{value}} OTHER_KEY {{value2}} {{value}}';
      component.cdRef.detectChanges();
      expect(nativeElement.innerText).toBe('string OTHER_KEY {{value2}} string');
    });

    it('should ignore param value if not matched', () => {
      component.toTranslateKey = '{{notMatching}} OTHER_KEY';
      component.cdRef.detectChanges();
      expect(nativeElement.innerText).toBe('{{notMatching}} OTHER_KEY');
    });
  });
});
