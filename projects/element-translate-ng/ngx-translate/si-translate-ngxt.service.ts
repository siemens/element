/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateService
} from '@ngx-translate/core';
import { SiTranslateService, TranslationResult } from '@siemens/element-translate-ng/translate';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * {@link SiTranslateService} wrapper around ngx-translate
 *
 * @internal
 */
@Injectable()
export class SiTranslateNgxTService extends SiTranslateService {
  private ngxTranslateService: TranslateService;
  private defaultTranslations: Record<string, string> = {};
  private originalMissingHandler: MissingTranslationHandler;

  constructor(ngxTranslateService: TranslateService) {
    super();
    this.ngxTranslateService = ngxTranslateService;
    this.originalMissingHandler = ngxTranslateService.missingTranslationHandler;
    ngxTranslateService.missingTranslationHandler = {
      handle: params => this.handleMissingTranslation(params)
    };

    this.translationChange$ = merge(
      this.ngxTranslateService.onTranslationChange,
      this.ngxTranslateService.onLangChange
    ).pipe(map(() => {}));
  }

  override get currentLanguage(): string {
    return this.ngxTranslateService.currentLang;
  }

  override get availableLanguages(): string[] {
    return this.ngxTranslateService.getLangs();
  }

  override set availableLanguages(languages: string[]) {
    this.ngxTranslateService.addLangs(languages);
  }

  override setCurrentLanguage(lang: string): Observable<void> {
    this.setDocumentLanguage(lang);
    return this.ngxTranslateService.use(lang).pipe(map(() => {}));
  }

  override getDefaultLanguage(): string {
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
    this.defaultTranslations[key] = value;
  }

  private handleMissingTranslation(params: MissingTranslationHandlerParams): string {
    return (
      params.translateService.parser.interpolate(
        this.defaultTranslations[params.key],
        params.interpolateParams
      ) ?? this.originalMissingHandler.handle(params)
    );
  }
}
