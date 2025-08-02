/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import {
  MissingTranslationHandlerParams,
  TranslateParser,
  TranslateService,
  Translation
} from '@ngx-translate/core';
import { SiTranslateService, TranslationResult } from '@siemens/element-translate-ng/translate';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface MissingTranslationHandler {
  handle: (params: MissingTranslationHandlerParams) => Translation | Observable<Translation>;
}

/**
 * {@link SiTranslateService} wrapper around ngx-translate
 *
 * @internal
 */
@Injectable()
export class SiTranslateNgxTService extends SiTranslateService {
  private ngxTranslateService: TranslateService;
  private parser: TranslateParser;
  private defaultTranslations: Record<string, string> = {};
  private originalMissingHandler: MissingTranslationHandler;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(ngxTranslateService: TranslateService, parser: TranslateParser) {
    super();
    this.ngxTranslateService = ngxTranslateService;
    this.parser = parser;
    this.originalMissingHandler = (ngxTranslateService as any)
      .missingTranslationHandler as MissingTranslationHandler;
    (ngxTranslateService as any).missingTranslationHandler = {
      handle: (params: MissingTranslationHandlerParams) => this.handleMissingTranslation(params)
    };

    this.translationChange$ = merge(
      this.ngxTranslateService.onTranslationChange,
      this.ngxTranslateService.onLangChange
    ).pipe(map(() => {}));
  }

  override get currentLanguage(): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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

  override getDefaultLanguage(): string {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return this.ngxTranslateService.getDefaultLang() ?? 'en';
  }

  override setDefaultLanguage(lang: string): void {
    this.setDocumentLanguage(lang);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
    const result =
      this.parser.interpolate(this.defaultTranslations[params.key], params.interpolateParams) ??
      this.originalMissingHandler.handle(params);
    if (typeof result === 'string') {
      return result;
    }
    throw new Error(
      `Invalid result type of missing translation handler: ${typeof result} ${result}`
    );
  }
}
