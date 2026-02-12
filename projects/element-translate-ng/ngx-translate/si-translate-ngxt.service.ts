/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isDevMode } from '@angular/core';
import { MissingTranslationHandler, TranslateService } from '@ngx-translate/core';
import { SiTranslateService, TranslationResult } from '@siemens/element-translate-ng/translate';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SiMissingTranslateService } from './si-missing-translate.service';

/**
 * {@link SiTranslateService} wrapper around ngx-translate
 *
 * @internal
 */
export class SiTranslateNgxTService extends SiTranslateService {
  private ngxTranslateService: TranslateService;
  private readonly fallbackTranslations?: SiMissingTranslateService;

  constructor(
    ngxTranslateService: TranslateService,
    missingTranslateHandler: MissingTranslationHandler | null
  ) {
    super();
    this.ngxTranslateService = ngxTranslateService;
    if (missingTranslateHandler instanceof SiMissingTranslateService) {
      this.fallbackTranslations = missingTranslateHandler;
    } else if (isDevMode()) {
      console.warn(
        'SiMissingTranslateService not provided as missingTranslateHandler, default translations will not work.'
      );
    }

    this.translationChange$ = merge(
      this.ngxTranslateService.onTranslationChange,
      this.ngxTranslateService.onLangChange
    ).pipe(map(() => {}));
  }

  override get currentLanguage(): string | undefined {
    return this.ngxTranslateService.currentLang;
  }

  override get availableLanguages(): readonly string[] {
    return this.ngxTranslateService.getLangs();
  }

  override set availableLanguages(languages: string[]) {
    this.ngxTranslateService.addLangs(languages);
  }

  override setCurrentLanguage(lang: string): Observable<void> {
    this.setDocumentLanguage(lang);
    return this.ngxTranslateService.use(lang).pipe(map(() => {}));
  }

  override getDefaultLanguage(): string | null {
    return this.ngxTranslateService.getDefaultLang();
  }

  override setDefaultLanguage(lang: string): void {
    this.setDocumentLanguage(lang);
    this.ngxTranslateService.setDefaultLang(lang);
  }

  override translate<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): Observable<TranslationResult<T>> | TranslationResult<T> {
    if (Array.isArray(keys) && !keys.length) {
      return of({} as TranslationResult<T>);
    }
    return this.ngxTranslateService.stream(keys, params);
  }

  override translateAsync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): Observable<TranslationResult<T>> {
    if (Array.isArray(keys) && !keys.length) {
      return of({} as TranslationResult<T>);
    }
    return this.ngxTranslateService.stream(keys, params);
  }

  override translateSync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): TranslationResult<T> {
    if (Array.isArray(keys) && !keys.length) {
      return {} as TranslationResult<T>;
    }
    return this.ngxTranslateService.instant(keys, params);
  }

  override setTranslation(key: string, value: string): void {
    this.fallbackTranslations?.setTranslation(key, value);
  }
}
