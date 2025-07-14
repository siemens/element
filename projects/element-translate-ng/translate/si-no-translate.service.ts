/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SiTranslateService, TranslationResult } from './si-translate.service';

const arrayToRecord = (keys: string[]): Record<string, string> =>
  keys.reduce(
    (acc, cur) => {
      acc[cur] = cur;
      return acc;
    },
    {} as Record<string, string>
  );

const replacePlaceholders = (str: string, params: Record<string, unknown>): string => {
  return str.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => {
    return params[p1] !== undefined ? String(params[p1]) : match;
  });
};

/**
 * Pass through implementation of the {@link SiTranslateService} which is used as a default.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class SiNoTranslateService extends SiTranslateService {
  override get currentLanguage(): string {
    return 'en';
  }

  override get availableLanguages(): string[] {
    return ['en'];
  }

  override set availableLanguages(lang: string[]) {}

  override setCurrentLanguage(lang: string): Observable<void> {
    return of();
  }

  override getDefaultLanguage(): string {
    return 'en';
  }

  override setDefaultLanguage(lang: string): void {}

  override translate<T extends string | string[]>(
    keys: T,
    _params?: Record<string, unknown>
  ): TranslationResult<T> {
    const translateKey = (key: string): string => {
      return _params ? replacePlaceholders(key, _params) : key;
    };

    if (typeof keys === 'string') {
      return translateKey(keys) as TranslationResult<T>;
    } else {
      const translatedKeys = keys.map(translateKey);
      return arrayToRecord(translatedKeys) as TranslationResult<T>;
    }
  }

  override translateSync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): TranslationResult<T> {
    return this.translate(keys, params);
  }

  override translateAsync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): Observable<TranslationResult<T>> {
    return of(this.translate(keys, params));
  }
}
