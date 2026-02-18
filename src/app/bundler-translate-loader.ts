/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

export class BundlerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    // Esbuild is preventing extensions of imported json files.
    // So we clone it.
    return from(import(`../assets/i18n/${lang}.json`).then(en => ({ ...en })));
  }
}
