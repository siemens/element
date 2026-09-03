/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  ResultDetailStep,
  SiResultDetailsListComponent
} from '@siemens/element-ng/result-details-list';

@Component({
  selector: 'app-sample',
  imports: [ReactiveFormsModule, SiResultDetailsListComponent, SiFormItemComponent],
  templateUrl: './si-result-details-list-playground.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly steps = computed<ResultDetailStep[]>(() => [
    {
      description: 'Volume flow sensor',
      state: 'passed',
      detail: 'Additional detail about state'
    },
    {
      description: 'Maximum differential pressure',
      state: 'passed',
      value: '4 kPa'
    },
    {
      description: 'Maximum volume flow',
      state: 'failed',
      errorMessage: 'Cannot reach maximum volume flow',
      value: '20 m³/h'
    },
    {
      description: 'Nominal volume flow',
      state: this.showProgress() ? 'running' : 'not-started'
    },
    {
      description: 'Nominal differential pressure',
      state: 'not-started'
    },
    {
      description: 'A not supported step',
      state: 'not-supported'
    },
    {
      description: 'A step with a custom icon',
      state: 'failed',
      icon: 'element-lock'
    }
  ]);
  readonly progressState = new FormControl<boolean>(true, { nonNullable: true });
  readonly showProgress = toSignal(this.progressState.valueChanges, {
    initialValue: this.progressState.value
  });
}
