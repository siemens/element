/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, min, minLength, required, validate } from '@angular/forms/signals';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';
import { TranslatableString } from '@siemens/element-translate-ng/translate';
import { page } from 'vitest/browser';

import { provideFormValidationErrorMapper } from '../si-form-validation-error.provider';
import { SiFormFieldComponent } from './si-form-field.component';

describe('SiFormFieldComponent', () => {
  interface Model {
    name: string;
    birthday: string;
    terms: boolean;
  }

  @Component({
    imports: [SiFormFieldComponent, FormField],
    template: `
      <si-form-field [label]="label()">
        <input type="text" class="form-control" [formField]="form.name" />
      </si-form-field>
      <si-form-field label="Day of birth">
        <input type="date" class="form-control" [formField]="form.birthday" />
      </si-form-field>
      <si-form-field label="Terms">
        <input type="checkbox" class="form-check-input" [formField]="form.terms" />
      </si-form-field>
    `
  })
  class TestHostComponent {
    readonly label = signal<TranslatableString>('Name');
    readonly model = signal<Model>({ name: '', birthday: '', terms: false });
    readonly form = form(this.model, path => {
      required(path.name, { message: 'Name is required' });
      minLength(path.name, 3, { message: 'NAME.MIN_LENGTH' });
      required(path.birthday, { message: 'A day of birth is required' });
      required(path.terms, { message: 'You must accept the terms' });
    });
  }

  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const nameField = page.getByRole('textbox', { name: 'Name' });
  const birthdayField = page.getByLabelText('Day of birth');
  const termsField = page.getByRole('checkbox', { name: 'Terms' });

  const blur = async (element: Element): Promise<void> => {
    (element as HTMLElement).focus();
    (element as HTMLElement).blur();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideNgxTranslateForElement(),
        provideTranslateService({
          missingTranslationHandler: provideMissingTranslationHandlerForElement()
        })
      ]
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { NAME: { MIN_LENGTH: 'Min. {{minLength}} characters' } });
    translate.use('en');

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should mark required controls as required', async () => {
    await expect.element(nameField).toBeRequired();
    await expect.element(termsField).toBeRequired();
  });

  it('should not mark as invalid if the field is untouched', async () => {
    await expect.element(nameField).not.toHaveAccessibleDescription();
    await expect.element(nameField).not.toHaveAttribute('aria-invalid');
  });

  it('should mark the control as invalid once touched and failing validation', async () => {
    await blur(nameField.element());

    await expect.element(nameField).toHaveAttribute('aria-invalid', 'true');
    await expect.element(nameField).toHaveAccessibleDescription(/Name is required/);
  });

  it('should interpolate translation parameters into the translated message', async () => {
    await nameField.fill('ab');
    await blur(nameField.element());

    await expect.element(nameField).toHaveAccessibleDescription(/Min\. 3 characters/);
  });

  it('should clear the invalid marker once the value becomes valid', async () => {
    await nameField.fill('Valid name');
    await blur(nameField.element());

    await expect.element(nameField).not.toHaveAttribute('aria-invalid');
  });

  it('should clear the error description once the value becomes valid', async () => {
    await nameField.fill('Valid name');
    await blur(nameField.element());

    await expect.element(nameField).not.toHaveAccessibleDescription();
    await expect.element(nameField).not.toHaveAttribute('aria-invalid');
  });

  it('should expose errors on all fields once the root form is marked as touched', async () => {
    component.form().markAsTouched();
    await fixture.whenStable();

    await expect.element(nameField).toHaveAccessibleDescription(/Name is required/);
    await expect.element(birthdayField).toHaveAccessibleDescription(/A day of birth is required/);
    await expect.element(termsField).toHaveAccessibleDescription(/You must accept the terms/);
  });
});

describe('SiFormFieldComponent validation error resolution', () => {
  interface Model {
    name: string;
    age: number;
    address: { city: string };
  }

  @Component({
    imports: [SiFormFieldComponent, FormField],
    template: `
      <si-form-field label="Name">
        <input type="text" class="form-control" [formField]="form.name" />
      </si-form-field>
      <si-form-field label="Age">
        <input type="number" class="form-control" [formField]="form.age" />
      </si-form-field>
      <si-form-field label="City">
        <input type="text" class="form-control" [formField]="form.address.city" />
      </si-form-field>
    `
  })
  class TestHostComponent {
    readonly model = signal<Model>({ name: '', age: 0, address: { city: '' } });
    // No `message` is provided on the validators, so the errors are resolved via the validation
    // error service. An explicit form name makes the generated field names deterministic:
    // the field name is `<parent name>.<key>`, rooted at the form name.
    readonly form = form(
      this.model,
      path => {
        required(path.name);
        min(path.age, 18);
        required(path.address.city);
        validate(path.name, ({ value }) =>
          value() === 'reserved' ? { kind: 'reserved' } : undefined
        );
      },
      { name: 'profile' }
    );
  }

  let fixture: ComponentFixture<TestHostComponent>;

  const nameField = page.getByRole('textbox', { name: 'Name' });
  const ageField = page.getByRole('spinbutton', { name: 'Age' });
  const cityField = page.getByRole('textbox', { name: 'City' });

  describe('with a global error mapper', () => {
    beforeEach(async () => {
      TestBed.configureTestingModule({
        providers: [
          provideFormValidationErrorMapper({
            required: 'A name is required',
            reserved: 'This value is reserved'
          })
        ]
      });
      fixture = TestBed.createComponent(TestHostComponent);
      await fixture.whenStable();
    });

    it('should only resolve message-less errors once the fields are touched', async () => {
      await expect.element(nameField).not.toHaveAccessibleDescription();
      await expect.element(ageField).not.toHaveAccessibleDescription();

      fixture.componentInstance.form().markAsTouched();
      await fixture.whenStable();

      // Resolved via the provided error mapper ...
      await expect.element(nameField).toHaveAccessibleDescription(/A name is required/);
      // ... and via the default mapper with interpolated params.
      await expect.element(ageField).toHaveAccessibleDescription(/Min\. 18/);
    });

    it('should resolve custom validation error kinds via the provided error mapper', async () => {
      await nameField.fill('reserved');
      fixture.componentInstance.form().markAsTouched();
      await fixture.whenStable();

      await expect.element(nameField).toHaveAccessibleDescription(/This value is reserved/);
    });
  });

  describe('with control-specific keys', () => {
    beforeEach(async () => {
      TestBed.configureTestingModule({
        providers: [
          provideFormValidationErrorMapper({
            required: 'Generic required',
            'profile.name.required': 'Name is mandatory'
          })
        ]
      });
      fixture = TestBed.createComponent(TestHostComponent);
      await fixture.whenStable();
    });

    it('should derive the field name from its path in the form', () => {
      const model = fixture.componentInstance.form;

      expect(model.name().name()).toBe('profile.name');
      expect(model.address.city().name()).toBe('profile.address.city');
    });

    it('should prefer the control-specific mapper key over the generic one', async () => {
      fixture.componentInstance.form().markAsTouched();
      await fixture.whenStable();

      // The name field matches the control-specific key ...
      await expect.element(nameField).toHaveAccessibleDescription(/Name is mandatory/);
      // ... while the city field falls back to the generic key.
      await expect.element(cityField).toHaveAccessibleDescription(/Generic required/);
    });

    it('should fall back to the raw error key when no mapper resolves the kind', async () => {
      // The `reserved` kind is covered neither by the provided mapper nor by the defaults, so the
      // template renders the raw key instead of an empty message.
      await nameField.fill('reserved');
      fixture.componentInstance.form().markAsTouched();
      await fixture.whenStable();

      await expect.element(nameField).toHaveAccessibleDescription(/reserved/);
    });
  });
});
