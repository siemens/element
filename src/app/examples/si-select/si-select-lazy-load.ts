/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import {
  SelectItem,
  SelectOption,
  SelectOptionSource,
  SiSelectComponent,
  SiSelectLazyOptionsDirective,
  SiSelectMultiValueDirective
} from '@spike-rabbit/element-ng/select';
import { LOG_EVENT } from '@spike-rabbit/live-preview';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Country, CountryService } from './country.service';

@Injectable({ providedIn: 'root' })
class CountryOptionSource implements SelectOptionSource<string> {
  private countryService = inject(CountryService);

  getOptionsForValues(keys: string[]): Observable<SelectOption<string>[]> {
    return this.countryService
      .getCountries(keys)
      .pipe(map(countries => this.countriesToOption(countries)));
  }

  getOptionsForSearch(search: string): Observable<SelectItem<string>[]> {
    return this.countryService
      .searchCountries(search.toLowerCase())
      .pipe(map(countries => this.countriesToOption(countries)));
  }

  compareOptions(a: SelectOption<string>, b: SelectOption<string>): number {
    return a.label!.localeCompare(b.label!);
  }

  private countriesToOption(countries: Country[]): SelectOption<string>[] {
    return countries.map(country => ({
      value: country.code,
      label: `${country.code} - ${country.name}`,
      type: 'option'
    }));
  }
}

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    SiFormItemComponent,
    SiSelectComponent,
    SiSelectMultiValueDirective,
    SiSelectLazyOptionsDirective
  ],
  templateUrl: './si-select-lazy-load.html',
  styles: 'si-select { max-inline-size: 300px}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly optionSource = inject(CountryOptionSource);
  readonly = false;
  disabled = false;
  value: string[] = ['DE'];

  selectionChanged(value: string[]): void {
    this.logEvent('Selection:', this.value);
  }
}
