/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { SiLoginSingleSignOnComponent as TestComponent } from './si-login-single-sign-on.component';

describe('SiLoginSingleSignOnComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  let disableSso: WritableSignal<boolean>;
  let ssoEvent: Mock<() => void>;

  beforeEach(async () => {
    disableSso = signal(false);
    ssoEvent = vi.fn();
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
