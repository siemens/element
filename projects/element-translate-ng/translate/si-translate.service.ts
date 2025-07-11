/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NEVER, Observable } from 'rxjs';

export type TranslationResult<T> = T extends string ? string : Record<string, string>;

/**
 * @returns The culture language code of the browser, e.g. "en-US".
 */
export const getBrowserCultureLanguage = (): string | undefined =>
  window?.navigator?.languages?.[0] ?? window?.navigator?.language;

/**
 * @returns The language code of the browser, e.g. "en".
 */
export const getBrowserLanguage = (): string | undefined =>
  getBrowserCultureLanguage()?.split(/-|_/)[0];

/**
 * Wrapper around an actual translation framework which is meant to be used internally by Element.
 * Applications must not use this service.
 *
 * Use {@link injectSiTranslateService} to get an instance of the translation service.
 *
 * @internal
 */
@Injectable()
export abstract class SiTranslateService {
  protected translationChange$: Observable<void> = NEVER;
  private documentRef: Document = inject(DOCUMENT);

  prevent$LocalizeInit?: boolean;

  /**
   * The currently used language.
   */
  abstract get currentLanguage(): string;

  /**
   * Sets a new language to be used. If needed, loads the language file.
   * @param lang - The language to be used.
   * @returns An observable that emits when the new language is loaded and activated.
   */
  abstract setCurrentLanguage(lang: string): Observable<void>;

  /**
   * The language to be used as default.
   * @param lang - The language code.
   */
  abstract setDefaultLanguage(lang: string): void;

  /**
   * The language to be used as default.
   * @returns The code of the default language.
   */
  abstract getDefaultLanguage(): string;

  /**
   * The available languages.
   */
  abstract get availableLanguages(): string[];
  abstract set availableLanguages(languages: string[]);

  /**
   * If the underlying translation library supports switching the language
   * and/or updating the translation texts, this observable will emit.
   * There is no initial emit.
   */
  get translationChange(): Observable<void> {
    return this.translationChange$;
  }

  /**
   * Translates the key(s) by using the underlying translation library.
   *
   * @param keys - A single translation key or an array of keys.
   * @param params - Parameters to be replaced within the translation text.
   *
   * @returns Returns the translated key or an object with the translated keys.
   * Depending on the underlying translation library (sync/async) the result will
   * be wrapped in an Observable.
   */
  abstract translate<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): Observable<TranslationResult<T>> | TranslationResult<T>;

  /**
   * Translates the key(s) by using the underlying translation library in an asynchronous manner.
   * It will emit each time the active language is changed.
   *
   * @param keys - A single translation key or an array of keys.
   * @param params - Parameters to be replaced within the translation text.
   *
   * @returns Returns the translated key or an object with the translated keys wrapped in an Observable.
   */
  abstract translateAsync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): Observable<TranslationResult<T>>;

  /**
   * Translates the key(s) by using the underlying translation library in a synchronous manner.
   *
   * Warning: The caller of this function needs to make sure the translation file(s) are already loaded.
   * It is generally not recommended to use this function unless you know exactly what you are doing.
   *
   * @param keys - A single translation key or an array of keys.
   * @param params - Parameters to be replaced within the translation text.
   *
   * @returns Returns the translated key or an object with the translated keys.
   */
  abstract translateSync<T extends string | string[]>(
    keys: T,
    params?: Record<string, unknown>
  ): TranslationResult<T>;

  /**
   * If supported by the underlying translation library, this method can be used to add a translation for a specific key.
   * It is intended to be used for adding the english default value.
   * It will be called whenever a key within element is resolved.
   * An implementation of this method must check that it does not override an existing translation.
   */
  setTranslation?(key: string, value: string): void;

  setDocumentLanguage(lang: string): void {
    this.documentRef?.documentElement?.setAttribute('lang', lang);
  }
}
