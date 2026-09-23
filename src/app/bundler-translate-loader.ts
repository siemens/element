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
        import(`../assets/i18n/element-ng/${lang}.json`),
        import(`../assets/i18n/dashboards-ng/${lang}.json`),
        import(`../assets/i18n/maps-ng/${lang}.json`),
        import(`../assets/i18n/common/${lang}.json`),
        import(`../assets/i18n/${lang}.json`)
      ]).then(([element, dashboards, maps, common, app]) => ({
        ...element,
        ...dashboards,
        ...maps,
        ...common,
        ...app
      }))
    );
  }
}
