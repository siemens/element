/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import {
  CriterionDefinition,
  OptionType,
  SiFilteredSearchComponent
} from '@siemens/element-ng/filtered-search';
import { LOG_EVENT } from '@siemens/live-preview';
import { Observable, Subject } from 'rxjs';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [SiFilterSettingsComponent, SiFilteredSearchComponent],
  templateUrl: './si-filtered-search-lazy-values.html',
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
      },
      {
        name: 'country',
        label: 'Country',
        options: [
          { value: 'DE', label: 'Germany' },
          { value: 'CH', label: 'Switzerland' }
        ]
      }
    ],
    lazyCriterionProvider: (typed: string): Observable<CriterionDefinition[]> => {
      const result = new Subject<CriterionDefinition[]>();
      const filteredCategories: CriterionDefinition[] = [];

      typed = typed ? typed.toLowerCase() : '';
      if (typed.length > 0) {
        this.filteredSearch.criteria.forEach(criterion => {
          if (criterion.label.toLocaleLowerCase().includes(typed)) {
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
    lazyValueProvider: (
      categoryName: string,
      typedVal: string | string[]
    ): Observable<OptionType[]> => {
      const subject = new Subject<OptionType[]>();
      const filteredValues: OptionType[] = [];
      if (Array.isArray(typedVal)) {
        this.processTypedText(categoryName, '', filteredValues, true);
      } else {
        this.processTypedText(categoryName, typedVal, filteredValues, false);
      }

      setTimeout(() => {
        // dummy timeout to simulate e.g. REST delay
        subject.next(filteredValues);
      }, 500);

      return subject.asObservable();
    }
  };
  private processTypedText(
    categoryName: string,
    typed: string,
    filteredValues: OptionType[],
    showAll: boolean
  ): void {
    typed = typed ? typed.toLowerCase() : '';
    const criterion = this.filteredSearch.criteria.find(cat => cat.name === categoryName);
    criterion?.options.forEach(value => {
      if (typeof value !== 'string') {
        if (showAll || value.label.toLocaleLowerCase().includes(typed)) {
          filteredValues.push(value);
        }
      } else {
        if (showAll || value.toLocaleLowerCase().includes(typed)) {
          filteredValues.push(value);
        }
      }
    });
  }
}
