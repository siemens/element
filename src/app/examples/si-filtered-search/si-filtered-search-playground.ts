/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  SearchCriteria,
  SiFilteredSearchComponent
} from '@spike-rabbit/element-ng/filtered-search';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    ReactiveFormsModule,
    SiFilteredSearchComponent,
    SiFormItemComponent,
    SiNumberInputComponent
  ],
  templateUrl: './si-filtered-search-playground.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  // injected by the live-previewer
  readonly logEvent = inject(LOG_EVENT);

  protected readonly configForm = new FormGroup({
    readonly: new FormControl(false, { nonNullable: true }),
    disabled: new FormControl(false, { nonNullable: true }),
    doSearchOnInputChange: new FormControl(true, { nonNullable: true }),
    disableFreeTextSearch: new FormControl(false, { nonNullable: true }),
    strictCriterion: new FormControl(false, { nonNullable: true }),
    strictValue: new FormControl(false, { nonNullable: true }),
    exclusiveCriteria: new FormControl(false, { nonNullable: true }),
    onlySelectValue: new FormControl(false, { nonNullable: true }),
    searchDebounceTime: new FormControl(0, { nonNullable: true }),
    optionsInScrollableView: new FormControl(10, { nonNullable: true }),
    maxCriteria: new FormControl(4, { nonNullable: true }),
    maxCriteriaOptions: new FormControl(20, { nonNullable: true }),
    searchCriteriaText: new FormControl<string>(
      '{ "criteria": [{"name":"location", "value":"Munich"}], "value": "" }',
      { nonNullable: true, updateOn: 'blur' }
    )
  });

  protected minDate = new Date(`${new Date().getFullYear() - 1}-03-12`);
  protected maxDate = new Date(`${new Date().getFullYear() + 1}-03-12`);
  protected searchCriteria: SearchCriteria = { criteria: [], value: '' };

  ngOnInit(): void {
    this.updateSearchCriteria(this.configForm.value.searchCriteriaText!);
    this.configForm.controls.searchCriteriaText.valueChanges.subscribe(value =>
      this.updateSearchCriteria(value)
    );
  }

  updateSearchCriteria(json: string): void {
    try {
      const input: SearchCriteria = JSON.parse(json) as unknown as SearchCriteria;
      if (input.criteria) {
        this.searchCriteria = input;
      }
    } catch (error) {
      this.logEvent((error as Error).message);
    }
  }
}
