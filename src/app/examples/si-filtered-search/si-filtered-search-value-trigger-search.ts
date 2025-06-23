/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiFilteredSearchComponent } from '@siemens/element-ng/filtered-search';
import { LOG_EVENT } from '@siemens/live-preview';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  templateUrl: './si-filtered-search-value-trigger-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiFilterSettingsComponent, SiFilteredSearchComponent]
})
export class SampleComponent {
  variant: BackgroundColorVariant = 'base-1';
  disable = false;
  disableFreeTextSearch = false;
  logEvent = inject(LOG_EVENT);
}
