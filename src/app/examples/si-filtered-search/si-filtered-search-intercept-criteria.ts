/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import {
  DisplayedCriteriaEventArgs,
  SiFilteredSearchComponent
} from '@siemens/element-ng/filtered-search';
import { LOG_EVENT } from '@siemens/live-preview';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [SiFilterSettingsComponent, SiFilteredSearchComponent],
  templateUrl: './si-filtered-search-intercept-criteria.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  variant: BackgroundColorVariant = 'base-1';
  disable = false;
  disableFreeTextSearch = false;
  logEvent = inject(LOG_EVENT);

  customizeVisibleCriteria(event: DisplayedCriteriaEventArgs): void {
    const visible = event.searchCriteria.criteria.some(s => s.name === 'foo')
      ? event.criteria.filter(c => c !== 'foo')
      : event.criteria;
    event.allow(visible);
  }
}
