/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateDefaultParser,
  Translation
} from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Handles missing translations by returning the default value if available.
 */
@Injectable()
export class SiMissingTranslateService implements MissingTranslationHandler {
  private readonly parser = new TranslateDefaultParser();
  private readonly defaultTranslations: Record<string, string> = {};

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private readonly appHandler?: MissingTranslationHandler) {}

  /** Sets a default translation for a given key. */
  setTranslation(key: string, value: string): void {
    this.defaultTranslations[key] = value;
  }
  /** Gets the default translation for a given key. */
  getDefault(key: string): string | undefined {
    return this.defaultTranslations[key];
  }
  /** {@inheritDoc} */
  handle(params: MissingTranslationHandlerParams): Translation | Observable<Translation> {
    const translated = this.getDefault(params.key);
    if (translated !== undefined) {
      return this.parser.interpolate(translated, params.interpolateParams);
    }
    return this.appHandler?.handle(params) ?? params.key;
  }
}
