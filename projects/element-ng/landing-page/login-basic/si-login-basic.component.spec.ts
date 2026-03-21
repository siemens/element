/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernamePassword, UsernameValidationPayload } from '../si-landing-page.model';
import { SiLoginBasicComponent as TestComponent } from './si-login-basic.component';

describe('SiLoginBasicComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let usernameLabel: WritableSignal<string>;
  let passwordLabel: WritableSignal<string>;
  let loginButtonLabel: WritableSignal<string>;
  let twoStep: WritableSignal<boolean>;
  let nextButtonLabel: WritableSignal<string>;
  let backButtonLabel: WritableSignal<string>;
  let usernameValidationSpy = vi.fn();
  let loginSpy = vi.fn();
  let valueChangedSpy = vi.fn();

  beforeEach(() => {
    usernameLabel = signal('Username');
    passwordLabel = signal('Password');
    loginButtonLabel = signal('Login');
    twoStep = signal(false);
    nextButtonLabel = signal('Next');
    backButtonLabel = signal('Back');
    usernameValidationSpy = vi.fn();
    loginSpy = vi.fn();
    valueChangedSpy = vi.fn();

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('usernameLabel', usernameLabel),
        inputBinding('passwordLabel', passwordLabel),
        inputBinding('loginButtonLabel', loginButtonLabel),
        inputBinding('twoStep', twoStep),
        inputBinding('nextButtonLabel', nextButtonLabel),
        inputBinding('backButtonLabel', backButtonLabel),
        outputBinding<UsernameValidationPayload>('usernameValidation', usernameValidationSpy),
        outputBinding<UsernamePassword>('login', loginSpy),
        outputBinding<UsernamePassword>('valueChanged', valueChangedSpy)
      ]
    });
    fixture.detectChanges();
  });

  it('should render username and password labels', async () => {
    usernameLabel.set('Test Username');
    passwordLabel.set('Test Password');
    await fixture.whenStable();

    const labels = fixture.nativeElement.querySelectorAll('label.form-label');
    expect(labels[0].textContent.trim()).toBe('Test Username');
    expect(labels[1].textContent.trim()).toBe('Test Password');
  });

  it('should render the login button with correct label', async () => {
    loginButtonLabel.set('Test Login');
    await fixture.whenStable();

    const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(loginButton).toBeTruthy();
    expect(loginButton.textContent.trim()).toBe('Test Login');
  });

  it('should handle two-step flow: show next button and then activate second step on click', async () => {
    twoStep.set(true);
    nextButtonLabel.set('Test Next');
    backButtonLabel.set('Test Back');
    loginButtonLabel.set('Test Login');
    await fixture.whenStable();

    // Initially, since twoStep is true and secondStep is false, next button should be visible and password block hidden.
    let nextButton = fixture.nativeElement.querySelector('.login-basic-next-button');
    expect(nextButton).toBeTruthy();
    expect(nextButton.textContent.trim()).toBe('Test Next');

    // Mock the usernameValidation output spy to simulate validation callback to activate second step.
    usernameValidationSpy.mockImplementation((payload: UsernameValidationPayload) => {
      payload.validate(true);
    });

    nextButton.click();
    await fixture.whenStable();

    // Ensure the usernameValidation event was emitted
    expect(usernameValidationSpy).toHaveBeenCalled();

    // Now, next button should be gone and password field should be rendered.
    nextButton = fixture.nativeElement.querySelector('.login-basic-next-button--container.active');
    expect(nextButton).toBeFalsy();

    const label = fixture.nativeElement.querySelector('label[for^="__si-login-basic-password-"]');
    expect(label).toBeTruthy();
  });

  it('should emit login event on form submit with correct credentials', async () => {
    loginButtonLabel.set('Test Login');
    await fixture.whenStable();

    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="username"]'
    );
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="password"]'
    );
    usernameInput.value = 'user@example.com';
    usernameInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'secret';
    passwordInput.dispatchEvent(new Event('input'));

    const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
    loginButton.click();
    await fixture.whenStable();

    expect(loginSpy).toHaveBeenCalledWith({ username: 'user@example.com', password: 'secret' });
  });

  it('should emit usernameValidation event on next button click with correct credentials', async () => {
    twoStep.set(true);
    nextButtonLabel.set('Test Next');
    await fixture.whenStable();

    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="username"]'
    );
    usernameInput.value = 'user@example.com';
    usernameInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const nextButton = fixture.nativeElement.querySelector('.login-basic-next-button');
    nextButton.click();
    await fixture.whenStable();

    expect(usernameValidationSpy).toHaveBeenCalled();
    const payload =
      usernameValidationSpy.mock.calls[usernameValidationSpy.mock.calls.length - 1][0];
    expect(payload.username).toBe('user@example.com');
  });

  it('should reset password when Back button is clicked in two-step flow', async () => {
    twoStep.set(true);
    backButtonLabel.set('Test Back');
    nextButtonLabel.set('Test Next');
    loginButtonLabel.set('Test Login');
    await fixture.whenStable();

    // Activate second step by simulating next button click.
    usernameValidationSpy.mockImplementation((payload: UsernameValidationPayload) => {
      payload.validate(true);
    });
    const nextButton = fixture.nativeElement.querySelector('.login-basic-next-button');
    nextButton.click();
    await fixture.whenStable();

    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="password"]'
    );
    passwordInput.value = 'secret';
    passwordInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const backButton = fixture.nativeElement.querySelector('button.btn-secondary');
    expect(backButton).toBeTruthy();
    backButton.click();
    await fixture.whenStable();

    expect(passwordInput.value).toBe('');
  });
});
