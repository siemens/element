/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SiStatusToggleComponent, StatusToggleItem } from '@siemens/element-ng/status-toggle';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [ReactiveFormsModule, SiStatusToggleComponent],
  templateUrl: './si-status-toggle.html'
})
export class SampleComponent implements OnInit {
  logEvent = inject(LOG_EVENT);
  private destroyRef = inject(DestroyRef);

  itemsPlain: StatusToggleItem[] = [
    { text: 'Not checked', value: 'A', icon: 'element-not-checked' },
    {
      text: 'Failed (error status)',
      value: 'B',
      icon: 'element-issue',
      activeIcon: 'element-circle-filled',
      activeIconStacked: 'element-state-exclamation-mark',
      activeIconClass: 'status-danger',
      activeIconStackedClass: 'status-danger-contrast',
      activeTextClass: 'text-danger'
    },
    {
      text: 'Passed',
      value: 'C',
      icon: 'element-checked',
      activeIcon: 'element-circle-filled',
      activeIconStacked: 'element-state-tick',
      activeIconClass: 'status-success',
      activeIconStackedClass: 'status-success-contrast',
      activeTextClass: 'text-success'
    }
  ];

  valuePlain: string | number = 'B';

  itemsTwoItems: StatusToggleItem[] = [
    { text: 'Not checked', value: 'A', icon: 'element-not-checked' },
    {
      text: 'Passed',
      value: 'C',
      icon: 'element-checked',
      activeIcon: 'element-circle-filled',
      activeIconStacked: 'element-state-tick',
      activeIconClass: 'status-success',
      activeIconStackedClass: 'status-success-contrast',
      activeTextClass: 'text-success'
    }
  ];

  valueTwoItems: string | number = 'C';

  itemsSingleDisabled: StatusToggleItem[] = [
    { text: 'Not checked', value: 'A', icon: 'element-not-checked' },
    {
      text: 'Failed',
      value: 'B',
      icon: 'element-issue',
      activeIcon: 'element-circle-filled',
      activeIconStacked: 'element-state-exclamation-mark',
      activeIconClass: 'status-danger',
      activeIconStackedClass: 'status-danger-contrast',
      activeTextClass: 'text-danger'
    },
    {
      text: 'Passed',
      value: 'C',
      icon: 'element-checked',
      activeIconClass: 'status-success',
      activeTextClass: 'text-success',
      disabled: true
    }
  ];

  valueSingleDisabled: string | number = 'A';

  itemsAllDisabled: StatusToggleItem[] = [
    { text: 'Not checked', value: 'A', icon: 'element-not-checked' },
    {
      text: 'Failed',
      value: 'B',
      icon: 'element-issue',
      activeIconClass: 'status-danger',
      activeTextClass: 'text-danger'
    },
    {
      text: 'Passed',
      value: 'C',
      icon: 'element-checked',
      activeIconClass: 'status-success',
      activeTextClass: 'text-success'
    }
  ];

  valueAllDisabled: string | number = 'A';

  itemsForm: StatusToggleItem[] = [
    { text: 'Not checked', value: 'A', icon: 'element-not-checked' },
    {
      text: 'Failed',
      value: 'B',
      icon: 'element-issue',
      activeIcon: 'element-circle-filled',
      activeIconStacked: 'element-state-exclamation-mark',
      activeIconClass: 'status-danger',
      activeIconStackedClass: 'status-danger-contrast',
      activeTextClass: 'text-danger'
    },
    {
      text: 'Passed',
      value: 'C',
      icon: 'element-checked',
      activeIcon: 'element-circle-filled',
      activeIconStacked: 'element-state-tick',
      activeIconClass: 'status-success',
      activeIconStackedClass: 'status-success-contrast',
      activeTextClass: 'text-success'
    }
  ];

  formControl = new FormControl('B');

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.logEvent('Form toggle value changed', event));
  }

  changePlainValue(): void {
    if (this.valuePlain === 'A') {
      this.valuePlain = 'B';
    } else if (this.valuePlain === 'B') {
      this.valuePlain = 'C';
    } else if (this.valuePlain === 'C') {
      this.valuePlain = 'A';
    }
  }
}
