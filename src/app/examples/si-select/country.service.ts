/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Country {
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private locale = inject(LOCALE_ID);

  private countries = this.buildCountryOptions();

  private buildCountryOptions(): Country[] {
    const countryName = new Intl.DisplayNames([this.locale], { type: 'region' });
    const countries: Country[] = [];
    for (let firstLetter = 65; firstLetter <= 90; ++firstLetter) {
      for (let secondLetter = 65; secondLetter <= 90; ++secondLetter) {
        const code = String.fromCharCode(firstLetter) + String.fromCharCode(secondLetter);
        const name = countryName.of(code);
        if (name && code !== name) {
          countries.push({ code, name });
        }
      }
    }
    return countries.sort((a, b) => a.name!.localeCompare(b.name!));
  }

  getCountries(codes: string[]): Observable<Country[]> {
    return of(this.countries.filter(country => codes.includes(country.code))).pipe(delay(1000));
  }

  searchCountries(search: string): Observable<Country[]> {
    const lowercaseSearch = search.toLowerCase();
    return of(
      this.countries.filter(
        country => country.code === search || country.name.toLowerCase().includes(lowercaseSearch)
      )
    ).pipe(delay(1000));
  }
}
