/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { enterValue } from '@siemens/element-ng/datepicker/components/test-helper.spec';

import { SiChangePasswordComponent as TestComponent } from './si-change-password.component';

const passwordStrengthValue = {
  minLength: 8,
  uppercase: true,
  lowercase: true,
  digits: true,
  special: true
};

describe('SiChangePasswordComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    component.setInput('passwordPolicyContent', 'Policy content');
    component.setInput('passwordStrength', passwordStrengthValue);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render new password and confirm password labels', () => {
    component.setInput('newPasswordLabel', 'Test New password');
    component.setInput('confirmPasswordLabel', 'Test Confirm password');
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('label.form-label');
    expect(labels[0].textContent.trim()).toBe('Test New password');
    expect(labels[1].textContent.trim()).toBe('Test Confirm password');
  });

  it('should render the change and back button with correct label', () => {
    component.setInput('changeButtonLabel', 'Test Change');
    component.setInput('backButtonLabel', 'Test Back');
    fixture.detectChanges();

    const changeButton = fixture.nativeElement.querySelector('button[type="submit"].btn-primary');
    const backButton = fixture.nativeElement.querySelector('button[type="button"].btn-secondary');

    expect(changeButton).toBeTruthy();
    expect(backButton).toBeTruthy();

    expect(changeButton.textContent.trim()).toBe('Test Change');
    expect(backButton.textContent.trim()).toBe('Test Back');
  });

  it('should render password policy correctly', () => {
    component.setInput('passwordPolicyTitle', 'Test password policy title');
    component.setInput('passwordPolicyContent', 'Test password policy content');
    fixture.detectChanges();

    const policyTitle = fixture.nativeElement.querySelector('.text-secondary .si-h5');
    const policyContent = fixture.nativeElement.querySelector('.text-secondary .my-4');
    expect(policyTitle.textContent.trim()).toBe('Test password policy title');
    expect(policyContent.textContent.trim()).toBe('Test password policy content');
  });

  it('should emit changePasswordRequested event on form submit with correct passwords', () => {
    const newPassword: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="newPassword"]'
    );
    const confirmPassword: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="confirmPassword"]'
    );

    enterValue(newPassword, 'NewSecret123!');
    enterValue(confirmPassword, 'NewSecret123!');
    fixture.detectChanges();

    const spy = vi.spyOn(component.instance.changePasswordRequested, 'emit');
    const changeButton = fixture.nativeElement.querySelector('button[type="submit"].btn-primary');
    changeButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith({
      newPassword: 'NewSecret123!',
      confirmPassword: 'NewSecret123!'
    });
  });

  it('should disable the change button when disableChange is set to true', () => {
    component.setInput('disableChange', true);
    fixture.detectChanges();

    const changeButton = fixture.nativeElement.querySelector('button[type="submit"].btn-primary');
    expect(changeButton.disabled).toBe(true);
  });

  it('should emit back event on back button click and reset the form', () => {
    const spy = vi.spyOn(component.instance.back, 'emit');
    const backButton = fixture.nativeElement.querySelector('button[type="button"].btn-secondary');
    const newPassword: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="newPassword"]'
    );
    const confirmPassword: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="confirmPassword"]'
    );

    enterValue(newPassword, 'NewSecret123!');
    enterValue(confirmPassword, 'NewSecret123!');
    fixture.detectChanges();

    expect(newPassword.value).toBe('NewSecret123!');
    expect(confirmPassword.value).toBe('NewSecret123!');

    expect(backButton).toBeTruthy();
    backButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(newPassword.value).toBe('');
    expect(confirmPassword.value).toBe('');
  });
});
