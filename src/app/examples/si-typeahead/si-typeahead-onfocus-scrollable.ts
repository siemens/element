/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackgroundColorVariant } from '@spike-rabbit/element-ng/common';
import { SiSearchBarModule } from '@spike-rabbit/element-ng/search-bar';
import { SiTypeaheadDirective } from '@spike-rabbit/element-ng/typeahead';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    SiFilterSettingsComponent,
    SiSearchBarModule,
    FormsModule,
    SiTypeaheadDirective
  ],
  templateUrl: './si-typeahead-onfocus-scrollable.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  variant: BackgroundColorVariant = 'base-1';
  showIcon = true;
  disable = false;
  disableFreeTextSearch = false;
  selected!: string;
  states = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Dakota',
    'North Carolina',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];
}
