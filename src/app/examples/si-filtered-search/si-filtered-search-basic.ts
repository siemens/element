/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiFilteredSearchComponent } from '@siemens/element-ng/filtered-search';
import { LOG_EVENT } from '@siemens/live-preview';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [SiFilterSettingsComponent, SiFilteredSearchComponent],
  templateUrl: './si-filtered-search-basic.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  readonly search = viewChild.required<SiFilteredSearchComponent>('search');
  variant: BackgroundColorVariant = 'base-1';
  disable = false;
  disableFreeTextSearch = false;
  logEvent = inject(LOG_EVENT);
  clear(): void {
    this.search().deleteAllCriteria();
  }
}
