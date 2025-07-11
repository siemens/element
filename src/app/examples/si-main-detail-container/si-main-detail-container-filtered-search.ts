/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import {
  SI_DATATABLE_CONFIG,
  SiDatatableInteractionDirective
} from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import {
  DisplayedCriteriaEventArgs,
  SearchCriteria,
  SiFilteredSearchComponent
} from '@siemens/element-ng/filtered-search';
import { SiMainDetailContainerComponent } from '@siemens/element-ng/main-detail-container';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee } from '../datatable/data.service';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    JsonPipe,
    SiContentActionBarComponent,
    SiDatatableInteractionDirective,
    SiEmptyStateComponent,
    SiFilteredSearchComponent,
    SiMainDetailContainerComponent
  ],
  templateUrl: './si-main-detail-container-filtered-search.html',
  host: {
    class: 'si-layout-fixed-height'
  }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  searchCriteria = {
    criteria: [
      { name: 'role', value: 'Engineer' },
      { name: 'company', value: 'Bar' },
      { name: 'age', operator: '>', value: '12' }
    ],
    value: ''
  };
  largeLayoutBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum; // this is the default
  detailsActive = false; // this is the default
  isLarge = true;
  mainActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Add',
      action: () => this.logEvent('Add triggered'),
      disabled: false
    }
  ];
  filteredRows: CorporateEmployee[] = [];
  allRows: CorporateEmployee[] = [];
  selectedEntity: CorporateEmployee | undefined;
  selectedEntities: CorporateEmployee[] = [];
  tableConfig = SI_DATATABLE_CONFIG;

  constructor() {
    for (let i = 1; i <= 250; i++) {
      this.allRows.push({
        id: i,
        name: 'Last ' + i,
        age: 10 + (i % 9),
        company: i % 2 === 0 ? 'Foo' : 'Bar',
        role: i % 3 === 0 ? 'Installer' : 'Engineer'
      });
    }
    this.updateFilter(this.searchCriteria);
  }

  datatableOnSelect(items: CorporateEmployee[]): void {
    this.selectedEntities = [...items];
    this.selectedEntity = this.selectedEntities[0];
    this.detailsActive = true;
    this.logEvent(this.selectedEntities);
  }

  onSplitChange(containerWidth: number | string): void {
    this.logEvent(`Main width is ${containerWidth}%.`);
  }

  updateFilter(searchCriteria?: SearchCriteria): void {
    if (searchCriteria) {
      this.filteredRows = this.allRows.filter(row => {
        if (searchCriteria.value === '' && searchCriteria.criteria.length === 0) {
          return true;
        }

        return searchCriteria.criteria.every(criteria => {
          const value = row[criteria.name as keyof CorporateEmployee];
          if (criteria.operator === '>') {
            return Number(value) > Number(criteria.value);
          } else if (criteria.operator === '<') {
            return Number(value) < Number(criteria.value);
          } else if (criteria.operator === '=') {
            return Number(value) === Number(criteria.value);
          } else if (!criteria.value) {
            return true;
          } else {
            return value === criteria.value;
          }
        });
      });
    }
  }

  singleOccurrence(event: DisplayedCriteriaEventArgs): void {
    event.allow(event.criteria.filter(c => !event.searchCriteria.criteria.some(s => s.name === c)));
  }
}
