/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Observable, of } from 'rxjs';

export abstract class SiLocaleStore {
  abstract get locale(): string | undefined;
  abstract saveLocale(locale: string): Observable<boolean>;
}

export const SI_LOCALE_LOCAL_STORAGE_KEY = 'lang';

export class SiDefaultLocaleStore extends SiLocaleStore {
  constructor(private isBrowser: boolean) {
    super();
  }

  get locale(): string | undefined {
    if (this.isBrowser) {
      return localStorage.getItem(SI_LOCALE_LOCAL_STORAGE_KEY) ?? undefined;
    } else {
      return undefined;
    }
  }

  saveLocale(locale: string): Observable<boolean> {
    if (this.isBrowser) {
      localStorage.setItem(SI_LOCALE_LOCAL_STORAGE_KEY, locale);
      return of(true);
    } else {
      return of(false);
    }
  }
}
