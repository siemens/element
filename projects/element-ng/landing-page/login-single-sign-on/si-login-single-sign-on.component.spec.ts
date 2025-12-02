/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiLoginSingleSignOnComponent as TestComponent } from './si-login-single-sign-on.component';

describe('SiLoginSingleSignOnComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should render the SSO button', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Login / Sign un');
  });

  it('should emit ssoEvent on button click', () => {
    spyOn(component.instance.ssoEvent, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.instance.ssoEvent.emit).toHaveBeenCalled();
  });

  it('should disable the SSO button when disableSso is true', () => {
    component.setInput('disableSso', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });
});
