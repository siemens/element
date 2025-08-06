/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackgroundColorVariant } from '@spike-rabbit/element-ng/common';
import { SiFilteredSearchComponent } from '@spike-rabbit/element-ng/filtered-search';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [SiFilterSettingsComponent, SiFilteredSearchComponent],
  templateUrl: './si-filtered-search-strict-criteria.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  variant: BackgroundColorVariant = 'base-1';
  disable = false;
  disableFreeTextSearch = false;
  logEvent = inject(LOG_EVENT);
}
