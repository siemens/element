/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordPolicy } from '@siemens/element-ng/password-strength';

import { ChangePassword } from '../si-landing-page.model';
import { SiChangePasswordComponent as TestComponent } from './si-change-password.component';

const passwordStrengthValue: PasswordPolicy = {
  minLength: 8,
  uppercase: true,
  lowercase: true,
  digits: true,
  special: true
};

describe('SiChangePasswordComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const passwordPolicyContent = signal<string>('Policy content');
  const passwordStrength = signal<PasswordPolicy>(passwordStrengthValue);
  const newPasswordLabel = signal('');
  const confirmPasswordLabel = signal('');
  const changeButtonLabel = signal('');
  const backButtonLabel = signal('');
  const disableChange = signal(false);
  const passwordPolicyTitle = signal('');
  const changePasswordRequested = vi.fn<(value: ChangePassword) => void>();
  const back = vi.fn();

  const enterValue = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('passwordPolicyContent', passwordPolicyContent),
        inputBinding('passwordStrength', passwordStrength),
        inputBinding('newPasswordLabel', newPasswordLabel),
        inputBinding('confirmPasswordLabel', confirmPasswordLabel),
        inputBinding('changeButtonLabel', changeButtonLabel),
        inputBinding('backButtonLabel', backButtonLabel),
        inputBinding('disableChange', disableChange),
        inputBinding('passwordPolicyTitle', passwordPolicyTitle),
        outputBinding('changePasswordRequested', changePasswordRequested),
        outputBinding('back', back)
      ]
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render new password and confirm password labels', async () => {
    newPasswordLabel.set('Test New password');
    confirmPasswordLabel.set('Test Confirm password');
    await fixture.whenStable();

    const labels = element.querySelectorAll('label.form-label');
    expect(labels[0]).toHaveTextContent('Test New password');
    expect(labels[1]).toHaveTextContent('Test Confirm password');
  });

  it('should render the change and back button with correct label', async () => {
    changeButtonLabel.set('Test Change');
    backButtonLabel.set('Test Back');
    await fixture.whenStable();

    const changeButton = element.querySelector('button[type="submit"].btn-primary');
    const backButton = element.querySelector('button[type="button"].btn-secondary');

    expect(changeButton).toBeTruthy();
    expect(backButton).toBeTruthy();

    expect(changeButton).toHaveTextContent('Test Change');
    expect(backButton).toHaveTextContent('Test Back');
  });

  it('should render password policy correctly', async () => {
    passwordPolicyTitle.set('Test password policy title');
    passwordPolicyContent.set('Test password policy content');
    await fixture.whenStable();

    const policyTitle = element.querySelector('.text-secondary .si-h5');
    const policyContentEl = element.querySelector('.text-secondary .my-4');
    expect(policyTitle).toHaveTextContent('Test password policy title');
    expect(policyContentEl).toHaveTextContent('Test password policy content');
  });

  it('should emit changePasswordRequested event on form submit with correct passwords', async () => {
    const newPassword: HTMLInputElement = element.querySelector(
      'input[formControlName="newPassword"]'
    )!;
    const confirmPassword: HTMLInputElement = element.querySelector(
      'input[formControlName="confirmPassword"]'
    )!;

    enterValue(newPassword, 'NewSecret123!');
    enterValue(confirmPassword, 'NewSecret123!');
    await fixture.whenStable();

    const changeButton: HTMLButtonElement = element.querySelector(
      'button[type="submit"].btn-primary'
    )!;
    changeButton.click();
    await fixture.whenStable();

    expect(changePasswordRequested).toHaveBeenCalledWith({
      newPassword: 'NewSecret123!',
      confirmPassword: 'NewSecret123!'
    });
  });

  it('should disable the change button when disableChange is set to true', async () => {
    disableChange.set(true);
    await fixture.whenStable();

    const changeButton = element.querySelector('button[type="submit"].btn-primary');
    expect(changeButton).toBeDisabled();
  });

  it('should emit back event on back button click and reset the form', async () => {
    const backButton: HTMLButtonElement = element.querySelector(
      'button[type="button"].btn-secondary'
    )!;
    const newPassword: HTMLInputElement = element.querySelector(
      'input[formControlName="newPassword"]'
    )!;
    const confirmPassword: HTMLInputElement = element.querySelector(
      'input[formControlName="confirmPassword"]'
    )!;

    enterValue(newPassword, 'NewSecret123!');
    enterValue(confirmPassword, 'NewSecret123!');
    await fixture.whenStable();

    expect(newPassword.value).toBe('NewSecret123!');
    expect(confirmPassword.value).toBe('NewSecret123!');

    expect(backButton).toBeTruthy();
    backButton.click();
    await fixture.whenStable();

    expect(back).toHaveBeenCalled();
    expect(newPassword.value).toBe('');
    expect(confirmPassword.value).toBe('');
  });
});
