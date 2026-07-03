/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { TranslatableString } from '@siemens/element-translate-ng/translate';
import { page } from 'vitest/browser';

import { SiFormFieldComponent } from './si-form-field.component';

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
    minLength(path.name, 3, { message: 'Min. 3 characters' });
    required(path.birthday, { message: 'A day of birth is required' });
    required(path.terms, { message: 'You must accept the terms' });
  });
}

describe('SiFormFieldComponent', () => {
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
