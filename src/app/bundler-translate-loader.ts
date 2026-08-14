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
    return from(
      Promise.all([
        import(`../assets/i18n/${lang}.json`),
        import('../assets/i18n-common/en.json')
      ]).then(([translations, commonTranslations]) => ({
        ...translations,
        ...commonTranslations
      }))
    );
  }
}
