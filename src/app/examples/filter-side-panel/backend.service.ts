/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable, LOCALE_ID, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { countryList, statusList, versionList } from './data-utils';
import { Country, FilterModel, Result, Status, Version } from './filter.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private readonly locale = inject(LOCALE_ID);

  countries(): Observable<Country[]> {
    return of(countryList(this.locale)).pipe(delay(1000));
  }

  states(): Observable<Status[]> {
    return of(statusList()).pipe(delay(500));
  }

  versions(count: number): Observable<Result<Version>> {
    const list = versionList();
    return of({
      items: list.splice(0, count),
      complete: count >= list.length,
      count: list.length
    }).pipe(delay(2000));
  }

  /** Current filter state */
  readonly filter = signal<FilterModel>({ states: [], versions: [], countries: [] });
}
