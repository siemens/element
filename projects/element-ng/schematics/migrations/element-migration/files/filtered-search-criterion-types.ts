/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Criterion,
  CriterionDefinition,
  SearchCriteria,
  SiFilteredSearchModule
} from '@siemens/element-ng/filtered-search';

@Component({
  selector: 'app-criterion-types-test',
  template: `
    <si-filtered-search
      [criteria]="criteria()"
      [lazyCriterionProvider]="lazyCriterionProvider()"
      (search)="onSearch($event)">
    </si-filtered-search>
  `,
  imports: [SiFilteredSearchModule],
  standalone: true
})
export class CriterionTypesTestComponent {
  // Test input with Criterion[] | CriterionDefinition[]
  criteria = input<Criterion[] | CriterionDefinition[]>([]);

  // Test input with function returning Observable<Criterion[] | CriterionDefinition[]>
  lazyCriterionProvider = input<
    (typed: string, searchCriteria?: SearchCriteria) => Observable<Criterion[] | CriterionDefinition[]>
  >();

  // Test method parameter and variable declaration
  onSearch(searchCriteria: SearchCriteria): void {
    const criterionValues: Criterion[] = searchCriteria.criteria;
    console.log(criterionValues);
  }

  // Test method return type
  getCriteria(): Criterion[] | CriterionDefinition[] {
    return [];
  }

  // Test with arrays
  processCriteria(items: Criterion[]): void {
    const filtered: Criterion[] = items.filter(c => c.id !== '');
  }

  // Test in generic type
  handleData(data: Array<Criterion>): Criterion[] {
    return data;
  }
}
