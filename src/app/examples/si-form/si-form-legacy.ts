/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import {
  DateRange,
  SiTimepickerComponent,
  SiDatepickerDirective,
  SiDateRangeComponent
} from '@siemens/element-ng/datepicker';
import {
  SiFormContainerComponent,
  SiFormModule,
  SiFormValidationError
} from '@siemens/element-ng/form';
import { PhoneDetails, SiPhoneNumberInputComponent } from '@siemens/element-ng/phone-number';
import { SelectOption, SiSelectModule } from '@siemens/element-ng/select';

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
  const start: Date = form.get('arrival')?.value;
  const end: Date = form.get('departure')?.value;

  if (start && end) {
    const isRangeValid = end.getTime() - start.getTime() > 0;
    return isRangeValid ? null : { departureTime: true };
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
  templateUrl: './si-form-legacy.html',
  providers: [JsonPipe],
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiCardComponent,
    ReactiveFormsModule,
    SiFormModule,
    TranslateModule,
    SiPhoneNumberInputComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiTimepickerComponent,
    SiSelectModule,
    JsonPipe
  ]
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

  errorCodeTranslateKeyMap = new Map<string, string>([
    ['name.required', 'FORM.NAME_REQUIRED'],
    ['phoneNumber.invalidPhoneNumberFormat', 'FORM.INVALID_PHONE'],
    ['required', 'FORM.REQUIRED'],
    ['termsAccepted.required', 'FORM.ACCEPT_TERMS_REQUIRED'],
    ['minlength', 'FORM.MINLENGTH'],
    ['notEighteen', 'FORM.NOT_EIGHTEEN'],
    ['departureTime', 'FORM.DEPARTURE_AFTER_ARRIVAL'],
    ['birthday.invalid', 'FORM.INVALID_DATE'],
    ['travelDate.invalidStartDateFormat', 'FORM.INVALID_DATE'],
    ['travelDate.invalidEndDateFormat', 'FORM.INVALID_DATE'],
    ['travelDate.endBeforeStart', 'FORM.END_BEFORE_START'],
    ['travelDate.required', 'FORM.TRAVEL_DATE_REQUIRED'],
    ['noEconomy', 'You deserve better!']
  ]);

  controlNameTranslateKeyMap = new Map<string, string>([
    ['name', 'FORM.NAME'],
    ['role', 'FORM.ROLE'],
    ['description', 'FORM.DESCRIPTION'],
    ['phoneNumber', 'FORM.PHONE_NUMBER'],
    ['birthday', 'FORM.BIRTHDAY'],
    ['termsAccepted', 'FORM.ACCEPT_TERMS'],
    ['serviceClass', 'FORM.CLASS']
  ]);

  readonly formContainer = viewChild.required(SiFormContainerComponent);

  entity?: Entity;

  readonly form = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      role: new FormControl<Role | null>(null),
      description: new FormControl(''),
      phoneNumber: new FormControl<PhoneDetails | null>(null),
      birthday: new FormControl<Date | string>('', [Validators.required, is18Years]),
      travelDate: new FormControl<DateRange | null>(null),
      arrival: new FormControl<Date | null>(null),
      departure: new FormControl<Date | null>(null),
      termsAccepted: new FormControl<boolean>(false, [Validators.requiredTrue]),
      serviceClass: new FormControl('first', noEconomy)
    },
    [arrivalDepartureTimeValidator]
  );

  disabledForm = false;

  readonly = false;

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.entity = new Entity();
    Object.assign(this.entity, this.form.value);
  }

  cancel(): void {
    this.form.reset(this.entity);
  }

  get departureErrors(): SiFormValidationError[] {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const errors = this.formContainer().getValidationErrors();
    return errors.filter(error => error.errorCode === 'departureTime');
  }

  toggleDisable(): void {
    this.disabledForm = !this.disabledForm;
    if (this.disabledForm) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  toggleReadonly(): void {
    this.readonly = !this.readonly;
    if (this.readonly) {
      this.form.controls.role.disable();
      this.form.controls.termsAccepted.disable();
    } else {
      this.form.controls.role.enable();
      this.form.controls.termsAccepted.enable();
    }
  }
}
