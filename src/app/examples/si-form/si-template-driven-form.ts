/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, Directive, effect, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NG_VALIDATORS,
  NgForm,
  ValidationErrors,
  Validator
} from '@angular/forms';
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

type Role = 'ENGINEER' | 'INSTALLER';

interface TravelRequest {
  name: string;
  role: Role | null;
  description: string;
  phoneNumber: PhoneDetails | null;
  birthday: Date | string;
  travelDate: DateRange | null;
  arrival: Date | null;
  departure: Date | null;
  serviceClass: string;
  fellowPassengers: number;
  termsAccepted: boolean;
  privacyDeclined: boolean;
}

const createEmptyRequest = (): TravelRequest => ({
  name: '',
  role: null,
  description: '',
  phoneNumber: null,
  birthday: '',
  travelDate: null,
  arrival: null,
  departure: null,
  serviceClass: 'first',
  fellowPassengers: 0,
  termsAccepted: false,
  privacyDeclined: false
});

@Directive({
  selector: '[appDepartureAfter]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useFactory: () => inject(DepartureAfterValidatorDirective),
      multi: true
    }
  ]
})
export class DepartureAfterValidatorDirective implements Validator {
  readonly arrival = input<Date | null>(null, { alias: 'appDepartureAfter' });
  private validatorChange?: () => void;

  constructor() {
    effect(() => {
      this.arrival();
      this.validatorChange?.();
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const arrival = this.arrival();
    const departure: unknown = control.value;
    return arrival instanceof Date &&
      departure instanceof Date &&
      departure.getTime() < arrival.getTime()
      ? { departureTime: true }
      : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorChange = fn;
  }
}

@Directive({
  selector: '[appNoEconomy]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useFactory: () => inject(NoEconomyValidatorDirective),
      multi: true
    }
  ]
})
export class NoEconomyValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === 'economy' ? { noEconomy: true } : null;
  }
}

@Directive({
  selector: '[appMinimumAge]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useFactory: () => inject(MinimumAgeValidatorDirective),
      multi: true
    }
  ]
})
export class MinimumAgeValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value: unknown = control.value;
    if (!value) {
      return null;
    }

    const birthday = value instanceof Date ? value : new Date(value as string);
    if (isNaN(birthday.getTime())) {
      return null;
    }

    return Date.now() - birthday.getTime() >= 18 * 31556952000 ? null : { notEighteen: value };
  }
}

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    DepartureAfterValidatorDirective,
    MinimumAgeValidatorDirective,
    NoEconomyValidatorDirective,
    SiCardComponent,
    SiCalendarButtonComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiFormDebugComponent,
    SiFormModule,
    SiHelpButtonComponent,
    SiNumberInputComponent,
    SiPhoneNumberInputComponent,
    SiSelectModule,
    SiTimepickerComponent
  ],
  templateUrl: './si-template-driven-form.html',
  providers: [
    provideFormValidationErrorMapper({
      'name.pattern': 'Name must start with an uppercase letter.',
      'name.required': 'Required',
      'role.required': 'Required',
      'birthday.required': 'Required',
      'birthday.notEighteen': 'You must be at least 18 years old.',
      'travelDate.required': 'Travel date is required.',
      'arrival.required': 'Required',
      'departure.required': 'Required',
      'departure.departureTime': 'The departure time must be after arrival.',
      'serviceClass.noEconomy': 'You deserve better!',
      'fellowPassengers.min': 'Min. 2',
      'termsAccepted.required': 'You need to accept all terms before joining.',
      'privacyDeclined.required': 'Required'
    })
  ],
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly optionsList: SelectOption<string>[] = [
    { type: 'option', value: 'first', label: 'First class' },
    { type: 'option', value: 'business', label: 'Business' },
    { type: 'option', value: 'economy', label: 'Economy' }
  ];

  protected model = createEmptyRequest();
  protected submitted?: TravelRequest;
  protected readonly debugState = signal({ disabled: false, readonly: false });

  protected save(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.submitted = structuredClone(this.model);
  }

  protected cancel(form: NgForm): void {
    this.model = this.submitted ? structuredClone(this.submitted) : createEmptyRequest();
    form.resetForm(this.model);
  }
}
