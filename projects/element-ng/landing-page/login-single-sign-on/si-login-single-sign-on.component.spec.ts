/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiLoginSingleSignOnComponent as TestComponent } from './si-login-single-sign-on.component';

describe('SiLoginSingleSignOnComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const disableSso = signal(false);
  const ssoEvent = vi.fn();

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('disableSso', disableSso), outputBinding('ssoEvent', ssoEvent)]
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the SSO button', () => {
    const button = element.querySelector('button');
    expect(button).toBeTruthy();
    expect(button).toHaveTextContent('Login / Sign un');
  });

  it('should emit ssoEvent on button click', () => {
    const button = element.querySelector('button')!;
    button.click();
    expect(ssoEvent).toHaveBeenCalled();
  });

  it('should disable the SSO button when disableSso is true', async () => {
    disableSso.set(true);
    await fixture.whenStable();

    const button = element.querySelector('button');
    expect(button).toBeDisabled();
  });
});
