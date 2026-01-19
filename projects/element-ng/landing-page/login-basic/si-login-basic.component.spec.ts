/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SiLoginBasicComponent as TestComponent } from './si-login-basic.component';

describe('SiLoginBasicComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent, BrowserAnimationsModule]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should render username and password labels', () => {
    component.setInput('usernameLabel', 'Test Username');
    component.setInput('passwordLabel', 'Test Password');
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('label.form-label');
    expect(labels[0].textContent.trim()).toBe('Test Username');
    expect(labels[1].textContent.trim()).toBe('Test Password');
  });

  it('should render the login button with correct label', () => {
    component.setInput('loginButtonLabel', 'Test Login');
    fixture.detectChanges();

    const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(loginButton).toBeTruthy();
    expect(loginButton.textContent.trim()).toBe('Test Login');
  });

  it('should handle two-step flow: show next button and then activate second step on click', () => {
    component.setInput('twoStep', true);
    component.setInput('nextButtonLabel', 'Test Next');
    component.setInput('backButtonLabel', 'Test Back');
    component.setInput('loginButtonLabel', 'Test Login');
    fixture.detectChanges();

    // Initially, since twoStep is true and secondStep is false, next button should be visible and password block hidden.
    let nextButton = fixture.nativeElement.querySelector('.login-basic-next-button');
    expect(nextButton).toBeTruthy();
    expect(nextButton.textContent.trim()).toBe('Test Next');

    // Spy on usernameValidation output and simulate validation callback to activate second step.
    const usernameValidationSpy = spyOn(component.instance.usernameValidation, 'emit').and.callFake(
      (payload: any) => {
        payload.validate(true);
      }
    );

    nextButton.click();
    fixture.detectChanges();

    // Ensure the usernameValidation event was emitted
    expect(usernameValidationSpy).toHaveBeenCalled();

    // Now, next button should be gone and password field should be rendered.
    nextButton = fixture.nativeElement.querySelector('.login-basic-next-button--container.active');
    expect(nextButton).toBeFalsy();

    const passwordLabel = fixture.nativeElement.querySelector(
      'label[for^="__si-login-basic-password-"]'
    );
    expect(passwordLabel).toBeTruthy();
  });

  it('should emit login event on form submit with correct credentials', () => {
    component.setInput('loginButtonLabel', 'Test Login');
    fixture.detectChanges();

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
    fixture.detectChanges();

    const spy = spyOn(component.instance.login, 'emit');
    const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
    loginButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith({ username: 'user@example.com', password: 'secret' });
  });

  it('should emit usernameValidation event on next button click with correct credentials', () => {
    component.setInput('twoStep', true);
    component.setInput('nextButtonLabel', 'Test Next');
    fixture.detectChanges();

    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="username"]'
    );
    usernameInput.value = 'user@example.com';
    usernameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const spy = spyOn(component.instance.usernameValidation, 'emit');
    const nextButton = fixture.nativeElement.querySelector('.login-basic-next-button');
    nextButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    const payload = spy.calls.mostRecent().args[0];
    expect(payload.username).toBe('user@example.com');
  });

  it('should reset password when Back button is clicked in two-step flow', () => {
    component.setInput('twoStep', true);
    component.setInput('backButtonLabel', 'Test Back');
    component.setInput('nextButtonLabel', 'Test Next');
    component.setInput('loginButtonLabel', 'Test Login');
    fixture.detectChanges();

    // Activate second step by simulating next button click.
    spyOn(component.instance.usernameValidation, 'emit').and.callFake((payload: any) => {
      payload.validate(true);
    });
    const nextButton = fixture.nativeElement.querySelector('.login-basic-next-button');
    nextButton.click();
    fixture.detectChanges();

    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="password"]'
    );
    passwordInput.value = 'secret';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('button.btn-secondary');
    expect(backButton).toBeTruthy();
    backButton.click();
    fixture.detectChanges();

    expect(passwordInput.value).toBe('');
  });
});
