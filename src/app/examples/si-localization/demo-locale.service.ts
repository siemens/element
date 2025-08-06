/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SiLocaleStore } from '@spike-rabbit/element-ng/localization';
import { lastValueFrom, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export const appLoadFactory = (service: DemoLocaleService) => () =>
  lastValueFrom(service.loadConfig());

@Injectable({
  providedIn: 'root'
})
export class DemoLocaleService extends SiLocaleStore {
  private static _locale = 'en';
  private http = inject(HttpClient);

  get locale(): string {
    return DemoLocaleService._locale;
  }

  saveLocale(locale: string): Observable<boolean> {
    // eslint-disable-next-line no-console
    console.log(
      `The DemoLocaleService should save the locale ${locale} to a server, but does not.`
    );
    return of(true);
  }

  loadConfig(): Observable<string> {
    return this.http
      .get<{ lang: string }>('/assets/locale.json')
      .pipe(map(config => config.lang))
      .pipe(
        tap(url => {
          DemoLocaleService._locale = url;
          // eslint-disable-next-line no-console
          console.log(
            `The DemoLocaleService loaded the locale ${DemoLocaleService._locale} from the server.`
          );
        })
      );
  }
}
