/**
 * Copyright (c) Siemens 2016 - 2025
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
  SiCalendarButtonComponent,
  SiDatepickerDirective,
  SiDateRangeComponent,
  SiTimepickerComponent
} from '@siemens/element-ng/datepicker';
import { SiFormContainerComponent, SiFormModule } from '@siemens/element-ng/form';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
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
    SiCalendarButtonComponent,
    SiCardComponent,
    SiFormModule,
    TranslateModule,
    SiPhoneNumberInputComponent,
    SiDatepickerDirective,
    SiTimepickerComponent,
    SiDateRangeComponent,
    SiSelectModule,
    SiNumberInputComponent,
    JsonPipe,
    ReactiveFormsModule
  ],
  templateUrl: './si-form.html',
  providers: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  errorCodeTranslateKeyMap = new Map<string, string>([
    ['name.pattern', 'FORM.NAME_UPPERCASE'],
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

  form = new FormGroup(
    {
      name: new FormControl(''),
      role: new FormControl<Role | null>(null, [Validators.required]),
      description: new FormControl(''),
      phoneNumber: new FormControl<PhoneDetails | null>(null),
      birthday: new FormControl<Date | string>('', is18Years),
      travelDate: new FormControl<DateRange | null>(null),
      arrival: new FormControl<Date | null>(null),
      departure: new FormControl<Date | null>(null),
      serviceClass: new FormControl('first', noEconomy),
      fellowPassengers: new FormControl(0, Validators.min(2)),
      termsAccepted: new FormControl<boolean>(false),
      privacyDeclined: new FormControl<boolean>(false)
    },
    [arrivalDepartureTimeValidator]
  );

  disabledFormControl = new FormControl(false, { nonNullable: true });
  readonlyControl = new FormControl(false, { nonNullable: true });
  readonly = false;

  constructor() {
    this.disabledFormControl.valueChanges.subscribe(v => this.toggleDisable(v));
    this.readonlyControl.valueChanges.subscribe(v => this.toggleReadonly(v));
  }

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

  toggleDisable(disabled: boolean): void {
    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  toggleReadonly(readonly: boolean): void {
    this.readonly = readonly;
    if (readonly) {
      this.form.controls.role.disable();
      this.form.controls.privacyDeclined.disable();
      this.form.controls.termsAccepted.disable();
    } else {
      this.form.controls.role.enable();
      this.form.controls.privacyDeclined.enable();
      this.form.controls.termsAccepted.enable();
    }
  }
}
