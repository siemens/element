/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import {
  disabled as disabledField,
  form,
  FormField,
  FormRoot,
  minLength,
  pattern,
  readonly as readonlyField,
  required,
  validate
} from '@angular/forms/signals';
import { SiCardComponent } from '@siemens/element-ng/card';
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
  SiFormFieldsetComponent,
  SiFormItemComponent
} from '@siemens/element-ng/form';
import { SiPhoneNumberInputComponent } from '@siemens/element-ng/phone-number';

export type Role = 'ENGINEER' | 'INSTALLER';
import { SiHelpButtonComponent } from '@siemens/element-ng/help-button';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { SelectOption, SiSelectModule } from '@siemens/element-ng/select';

import { SiFormDebugComponent } from './si-form-debug';

export interface TravelRequest {
  name: string;
  description: string;
  phoneNumber: string;
  birthday: Date | string;
  travelDate: DateRange;
  arrival: Date | null;
  departure: Date | null;
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
  arrival: null,
  departure: null,
  serviceClass: 'first',
  role: '',
  fellowPassengers: 0,
  termsAccepted: false,
  privacyDeclined: false
};

@Component({
  selector: 'app-sample',
  imports: [
    FormField,
    FormRoot,
    SiCardComponent,
    SiCalendarButtonComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiFormDebugComponent,
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
  protected readonly debugState = signal({ disabled: false, readonly: false });

  protected readonly form = form(
    this.model,
    path => {
      disabledField(path, { when: () => this.debugState().disabled });
      readonlyField(path, { when: () => this.debugState().readonly });
      disabledField(path.role, { when: () => this.debugState().readonly });
      disabledField(path.termsAccepted, { when: () => this.debugState().readonly });
      disabledField(path.privacyDeclined, { when: () => this.debugState().readonly });
      required(path.name, { message: 'Required' });
      minLength(path.name, 3, { message: 'Min. 3 characters' });
      pattern(path.name, /^[A-Z].*/, {
        message: 'Name must start with an uppercase letter.'
      });
      required(path.birthday, { message: 'Required' });
      validate(path.birthday, ({ value }) => {
        const valueAsDate = value();
        if (!valueAsDate) {
          return undefined;
        }

        const birthday = new Date(valueAsDate);
        if (isNaN(birthday.getTime())) {
          return undefined;
        }

        const age = Date.now() - birthday.getTime();
        return age >= 18 * 31556952000
          ? undefined
          : { kind: 'notEighteen', message: 'You must be at least 18 years old.' };
      });
      required(path.travelDate, { message: 'Travel date is required.' });
      validate(path.travelDate, ({ value }) => {
        const { start, end } = value();
        return !start || !end
          ? { kind: 'required', message: 'Travel date is required.' }
          : undefined;
      });
      required(path.arrival, { message: 'Required' });
      required(path.departure, { message: 'Required' });
      validate(path.departure, ({ value, valueOf }) => {
        const arrival = valueOf(path.arrival);
        const departure = value();
        if (!arrival || !departure) {
          return undefined;
        }

        return departure.getTime() >= arrival.getTime()
          ? undefined
          : { kind: 'departureTime', message: 'The departure time must be after arrival.' };
      });
      validate(path.serviceClass, ({ value }) =>
        value() === 'economy' ? { kind: 'noEconomy', message: 'You deserve better!' } : undefined
      );
      required(path.role, { message: 'Role required' });
      validate(path.fellowPassengers, ({ value }) =>
        value() >= 2 ? undefined : { kind: 'min', message: 'Min. 2' }
      );
      required(path.termsAccepted, {
        message: 'You need to accept all terms before joining.'
      });
      required(path.privacyDeclined, {
        message: 'Required'
      });
    },
    {
      submission: {
        action: async () => {
          this.submitted.set(structuredClone(this.model()));
          return undefined;
        }
      }
    }
  );

  protected cancel(): void {
    const submitted = this.submitted();
    this.form().reset(structuredClone(submitted ?? emptyRequest));
  }
}
