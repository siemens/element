/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { disabled, form, FormField, minLength } from '@angular/forms/signals';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiSearchBarModule } from '@siemens/element-ng/search-bar';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    FormField,
    SiFilterSettingsComponent,
    SiSearchBarModule,
    SiTypeaheadDirective
  ],
  templateUrl: './si-typeahead-basic.html'
})
export class SampleComponent {
  variant: BackgroundColorVariant = 'base-1';
  readonly disable = signal(false);
  showIcon = false;
  readonly model = signal('');
  readonly searchField = form(this.model, path => {
    minLength(path, 3, { message: 'Min. 3 characters' });
    disabled(path, { when: () => this.disable() });
  });
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
