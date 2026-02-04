/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CriterionValue,
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
  // Test input with CriterionDefinition[]
  criteria = input<CriterionDefinition[]>([]);

  // Test input with function returning Observable<CriterionDefinition[]>
  lazyCriterionProvider = input<
    (typed: string, searchCriteria?: SearchCriteria) => Observable<CriterionDefinition[]>
  >();

  // Test method parameter and variable declaration
  onSearch(searchCriteria: SearchCriteria): void {
    const criterionValues: CriterionValue[] = searchCriteria.criteria;
    console.log(criterionValues);
  }

  // Test method return type
  getCriteria(): CriterionDefinition[] {
    return [];
  }

  // Test with arrays
  processCriteria(items: CriterionValue[]): void {
    const filtered: CriterionValue[] = items.filter(c => c.id !== '');
  }

  // Test in generic type
  handleData(data: Array<CriterionValue>): CriterionValue[] {
    return data;
  }
}
