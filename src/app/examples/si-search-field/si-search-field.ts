/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, debounced, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { provideSiFormFieldConfig } from '@siemens/element-ng/form';
import { SiSearchFieldComponent } from '@siemens/element-ng/search-field';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';

@Component({
  selector: 'app-sample',
  imports: [FormField, SiSearchFieldComponent, SiTypeaheadDirective],
  templateUrl: './si-search-field.html',
  providers: [provideSiFormFieldConfig()],
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly searchTerm = signal('');
  readonly searchField = form(this.searchTerm);
  readonly debouncedSearchTerm = debounced(this.searchTerm, 400);
  readonly states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado'];
}
