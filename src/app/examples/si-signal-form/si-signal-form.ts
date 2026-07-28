/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  minLength,
  pattern,
  required,
  validate
} from '@angular/forms/signals';
import {
  DateRange,
  SiCalendarButtonComponent,
  SiDatepickerDirective,
  SiDateRangeComponent,
  SiTimepickerComponent
} from '@siemens/element-ng/datepicker';
import {
  provideSiFormFieldConfig,
  SiFormFieldComponent,
  SiFormFieldsetComponent
} from '@siemens/element-ng/form';
import { SiPhoneNumberInputComponent } from '@siemens/element-ng/phone-number';

export type Role = 'engineer' | 'installer';
import { SiHelpButtonComponent } from '@siemens/element-ng/help-button';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { SelectOption, SiSelectModule } from '@siemens/element-ng/select';

export interface TravelRequest {
  name: string;
  description: string;
  phoneNumber: string;
  birthday: Date | string;
  travelDate: DateRange;
  arrival: Date;
  departure: Date;
  serviceClass: string;
  role: Role | '';
  fellowPassengers: number;
  termsAccepted: boolean;
  privacyDeclined: boolean;
}

const emptyRequest: TravelRequest = {
  name: '',
  description: '',
  phoneNumber: '',
  birthday: '',
  travelDate: { start: undefined, end: undefined },
  arrival: new Date(NaN),
  departure: new Date(NaN),
  serviceClass: 'first',
  role: '',
  fellowPassengers: 0,
  termsAccepted: false,
  privacyDeclined: false
};

@Component({
  selector: 'app-sample',
  imports: [
    JsonPipe,
    FormField,
    FormRoot,
    SiCalendarButtonComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiFormFieldComponent,
    SiFormFieldsetComponent,
    SiHelpButtonComponent,
    SiNumberInputComponent,
    SiPhoneNumberInputComponent,
    SiSelectModule,
    SiTimepickerComponent
  ],
  templateUrl: './si-signal-form.html',
  providers: [provideSiFormFieldConfig()],
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly optionsList: SelectOption<string>[] = [
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

  protected readonly model = signal<TravelRequest>({ ...emptyRequest });

  protected readonly submitted = signal<TravelRequest | undefined>(undefined);

  protected readonly form = form(
    this.model,
    path => {
      required(path.name, { message: 'Name required' });
      minLength(path.name, 3, { message: 'Minimum 3 characters' });
      pattern(path.name, /^[A-Z].*/, {
        message: 'Name must start with an uppercase letter'
      });
      validate(path.birthday, ({ value }) => {
        const valueAsDate = value();
        if (!valueAsDate) {
          return { kind: 'required', message: 'Day of birth required' };
        }

        const birthday = new Date(valueAsDate);
        if (isNaN(birthday.getTime())) {
          return undefined;
        }

        const age = Date.now() - birthday.getTime();
        return age >= 18 * 31556952000
          ? undefined
          : { kind: 'notEighteen', message: 'You must be at least 18 years old' };
      });
      validate(path.travelDate, ({ value }) => {
        const { start, end } = value();
        return !start || !end
          ? { kind: 'required', message: 'Travel dates are required' }
          : undefined;
      });
      validate(path.departure, ({ value, valueOf }) => {
        const arrival = valueOf(path.arrival);
        const departure = value();
        if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
          return { kind: 'required', message: 'Arrival and departure times are required' };
        }

        return departure.getTime() >= arrival.getTime()
          ? undefined
          : { kind: 'departureTime', message: 'Departure must be after arrival' };
      });
      validate(path.serviceClass, ({ value }) =>
        value() === 'economy' ? { kind: 'noEconomy', message: 'You deserve better!' } : undefined
      );
      required(path.role, { message: 'Role required' });
      validate(path.fellowPassengers, ({ value }) =>
        value() >= 2 ? undefined : { kind: 'min', message: 'Minimum 2' }
      );
      required(path.termsAccepted, {
        message: 'Accept terms before joining'
      });
      required(path.privacyDeclined, {
        message: 'Accept the privacy policy before joining'
      });
    },
    {
      submission: {
        action: async () => {
          this.submitted.set(this.model());
          return undefined;
        }
      }
    }
  );

  protected cancel(): void {
    this.model.set({ ...emptyRequest });
    this.submitted.set(undefined);
  }
}
