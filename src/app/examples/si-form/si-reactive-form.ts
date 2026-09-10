/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, effect, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
// eslint-disable-next-line no-restricted-imports
import { TranslatePipe } from '@ngx-translate/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import {
  DateRange,
  SiCalendarButtonComponent,
  SiDatepickerDirective,
  SiDateRangeComponent,
  SiTimepickerComponent
} from '@siemens/element-ng/datepicker';
import { provideFormValidationErrorMapper, SiFormModule } from '@siemens/element-ng/form';
import { SiHelpButtonComponent } from '@siemens/element-ng/help-button';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { PhoneDetails, SiPhoneNumberInputComponent } from '@siemens/element-ng/phone-number';
import { SelectOption, SiSelectModule } from '@siemens/element-ng/select';

import { SiFormDebugComponent } from './si-form-debug';

export type Role = 'ENGINEER' | 'INSTALLER';

export class Entity {
  id!: number;
  name!: string;
  role!: Role;
  description?: string;
  phoneNumber?: PhoneDetails;
  termsAccepted = false;
  birthday!: Date;
  travelDate!: DateRange;
  arrival?: Date;
  departure?: Date;
  serviceClass!: string;
}

export const is18Years: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value || isNaN(control.value.getTime())) {
    return null;
  }
  const date: Date = control.value;
  const now = new Date();
  const eighteen = 18 * 31556952000;
  const diff = now.getTime() - date.getTime();
  return diff >= eighteen ? null : { notEighteen: control.value };
};

export const arrivalDepartureTimeValidator: ValidatorFn = (
  form: AbstractControl
): ValidationErrors | null => {
  const start = form.get('arrival')!;
  const end = form.get('departure')!;

  if (start.value && end.value && end.value.getTime() - start.value.getTime() < 0) {
    end.setErrors({ departureTime: true });
  }

  return null;
};

export const noEconomy: ValidatorFn = control => {
  if (control.value === 'economy') {
    return {
      noEconomy: true
    };
  }
  return null;
};

@Component({
  selector: 'app-sample',
  imports: [
    ReactiveFormsModule,
    SiCalendarButtonComponent,
    SiCardComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiFormDebugComponent,
    SiFormModule,
    SiHelpButtonComponent,
    SiNumberInputComponent,
    SiPhoneNumberInputComponent,
    SiSelectModule,
    SiTimepickerComponent,
    TranslatePipe
  ],
  templateUrl: './si-reactive-form.html',
  providers: [
    provideFormValidationErrorMapper({
      'name.pattern': 'Name must start with an uppercase letter.',
      'name.required': 'FORM.NAME_REQUIRED',
      'termsAccepted.required': 'FORM.ACCEPT_TERMS_REQUIRED',
      notEighteen: 'You must be at least 18 years old.',
      departureTime: 'FORM.DEPARTURE_AFTER_ARRIVAL',
      'travelDate.endBeforeStart': 'FORM.END_BEFORE_START',
      'travelDate.required': 'FORM.TRAVEL_DATE_REQUIRED',
      noEconomy: 'You deserve better!'
    })
  ],
  host: { class: 'p-5' }
})
export class SampleComponent {
  optionsList: SelectOption<string>[] = [
    {
      type: 'option',
      value: 'first',
      icon: 'element-face-happy',
      iconColor: 'status-success',
      label: 'First class'
    },
    {
      type: 'option',
      value: 'business',
      icon: 'element-face-neutral',
      iconColor: 'status-warning',
      label: 'Business'
    },
    {
      type: 'option',
      value: 'economy',
      icon: 'element-face-unhappy',
      iconColor: 'status-danger',
      label: 'Economy'
    }
  ];

  submitted?: Entity;

  form = new FormGroup(
    {
      name: new FormControl(''),
      role: new FormControl<Role | null>(null, [Validators.required]),
      description: new FormControl(''),
      phoneNumber: new FormControl<PhoneDetails | null>(null),
      birthday: new FormControl<Date | string>('', is18Years),
      travelDate: new FormControl<DateRange | null>(null),
      arrival: new FormControl<Date | null>(null, Validators.required),
      departure: new FormControl<Date | null>(null, Validators.required),
      serviceClass: new FormControl('first', noEconomy),
      fellowPassengers: new FormControl(0, Validators.min(2)),
      termsAccepted: new FormControl<boolean>(false),
      privacyDeclined: new FormControl<boolean>(false)
    },
    [arrivalDepartureTimeValidator]
  );

  readonly debugState = signal({ disabled: false, readonly: false });
  readonly = false;

  constructor() {
    effect(() => {
      const { disabled, readonly } = this.debugState();
      this.readonly = readonly;

      if (disabled) {
        this.form.disable();
      } else {
        this.form.enable();
        if (readonly) {
          this.form.controls.role.disable();
          this.form.controls.privacyDeclined.disable();
          this.form.controls.termsAccepted.disable();
        }
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted = new Entity();
    Object.assign(this.submitted, this.form.getRawValue());
  }

  cancel(): void {
    this.form.reset(this.submitted);
  }
}
