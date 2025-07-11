/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import {
  CriterionDefinition,
  SearchCriteria,
  SiFilteredSearchComponent
} from '@siemens/element-ng/filtered-search';
import { LOG_EVENT } from '@siemens/live-preview';
import { Observable, Subject } from 'rxjs';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [SiFilterSettingsComponent, SiFilteredSearchComponent],
  templateUrl: './si-filtered-search-lazy-criteria.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  variant: BackgroundColorVariant = 'base-1';
  disable = false;
  disableFreeTextSearch = false;
  logEvent = inject(LOG_EVENT);
  public filteredSearch = {
    criteria: [
      {
        name: 'company',
        label: 'Company',
        options: ['Foo', 'Bar']
      },
      {
        name: 'location',
        label: 'Location',
        options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
      },
      {
        name: 'day',
        label: 'Day',
        options: ['Today', 'Tomorrow', 'The day after tomorrow']
      },
      {
        name: 'ABCDEFGHIJKLMNOPQR',
        label: 'Characters',
        options: [
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI',
          'ABC',
          'DEF',
          'GHI'
        ]
      }
    ],
    lazyCriterionProvider: (
      typed: string,
      searchCriteria?: SearchCriteria
    ): Observable<CriterionDefinition[]> => {
      const result = new Subject<CriterionDefinition[]>();
      const filteredCategories: CriterionDefinition[] = [];

      typed = typed ? typed.toLowerCase() : '';
      if (typed.length > 0) {
        this.filteredSearch.criteria.forEach((criterion: CriterionDefinition) => {
          if (
            criterion.label?.toLocaleLowerCase().includes(typed) &&
            !searchCriteria?.criteria.some(element => element.label === criterion.label)
          ) {
            filteredCategories.push(criterion);
          }
        });
      }

      setTimeout(() => {
        // dummy timeout to simulate e.g. REST delay
        result.next(filteredCategories);
      }, 500);
      return result.asObservable();
    },
    lazyValueProvider: (categoryName: string, typed: string | string[]): Observable<string[]> => {
      const subject = new Subject<string[]>();

      const typedArray = typeof typed === 'string' ? [typed] : typed;

      const filteredValues: string[] = [];
      const criterion = this.filteredSearch.criteria.filter(cat => cat.name === categoryName)[0];
      if (criterion) {
        criterion.options.forEach(value => {
          if (typedArray.every(typedValue => value.toLocaleLowerCase().includes(typedValue))) {
            filteredValues.push(value);
          }
        });
      }
      setTimeout(() => {
        // dummy timeout to simulate e.g. REST delay
        subject.next(filteredValues);
      }, 500);

      return subject.asObservable();
    }
  };
}
