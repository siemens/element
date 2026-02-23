/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiSearchBarModule } from '@siemens/element-ng/search-bar';
import { SiTypeaheadDirective, TypeaheadOptionSource } from '@siemens/element-ng/typeahead';

import { SiFilterSettingsComponent } from '../si-filter-settings/si-filter-settings.component';
import { StatesService } from './states.service';

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    SiFilterSettingsComponent,
    SiSearchBarModule,
    FormsModule,
    SiTypeaheadDirective
  ],
  templateUrl: './si-typeahead-async.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private statesService = inject(StatesService);

  variant: BackgroundColorVariant = 'base-1';
  disable = false;
  showIcon = false;
  selected!: string;

  states: TypeaheadOptionSource = {
    getOptionsForSearch: (search: string) => this.statesService.getStates(search)
  };
}
