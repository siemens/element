/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import {
  PasswordPolicy,
  SiPasswordStrengthModule,
  SiPasswordStrengthComponent as TestComponent
} from '.';

const passwordStrengthValue: PasswordPolicy = {
  minLength: 8,
  uppercase: true,
  lowercase: true,
  digits: true,
  special: true
};

@Component({
  template: `
    <si-password-strength>
      <input
        #input
        id="password"
        type="password"
        name="password"
        aria-label="password"
        class="form-control"
        ngModel
        [siPasswordStrength]="passwordStrengthConfig"
        (passwordStrengthChanged)="passwordStrengthChangedFunc($event)"
      />
    </si-password-strength>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiPasswordStrengthModule, FormsModule, SiTranslateModule]
})
class WrapperComponent {
  readonly passwordStrength = viewChild.required<TestComponent, ElementRef<TestComponent>>(
    TestComponent,
    { read: ElementRef }
  );
  readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('input');
  passwordStrengthConfig = { ...passwordStrengthValue };
  passwordStrengthChangedFunc = jasmine.createSpy('passwordStrengthChanged', (event: any) => {});
}

describe('SiPasswordStrengthDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let component: ElementRef;
  let inputElement: HTMLInputElement;
  let element: HTMLElement;

  const setInput = (value: string): void => {
    inputElement.value = value;
    inputElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiPasswordStrengthModule, FormsModule, SiTranslateModule, WrapperComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = wrapperComponent.passwordStrength();
    inputElement = wrapperComponent.inputElement().nativeElement;
    element = component.nativeElement;
  });

  it('should not display anything when the field is empty', () => {
    fixture.detectChanges();

    expect(element.classList.length).toBe(0);
    expect(wrapperComponent.passwordStrengthChangedFunc).not.toHaveBeenCalledWith(
      jasmine.any(Number)
    );

    setInput('f');

    expect(element.classList.length).not.toBe(0);
    expect(wrapperComponent.passwordStrengthChangedFunc).toHaveBeenCalledWith(-4);
    wrapperComponent.passwordStrengthChangedFunc.calls.reset();

    setInput('');

    expect(element.classList.length).toBe(0);
    expect(wrapperComponent.passwordStrengthChangedFunc).not.toHaveBeenCalledWith(
      jasmine.any(Number)
    );
  });

  it('should display bad when the field is filled by one letter', () => {
    fixture.detectChanges();

    setInput('f');

    expect(element.classList.contains('bad')).toBeTrue();

    setInput('');

    expect(element.classList.contains('bad')).toBeFalse();
    expect(wrapperComponent.passwordStrengthChangedFunc).toHaveBeenCalledWith(-4);
  });

  it('should display weak when the field is filled by one letter and one number', () => {
    fixture.detectChanges();

    setInput('f3');

    expect(element.classList.contains('weak')).toBeTrue();

    setInput('');

    expect(element.classList.contains('weak')).toBeFalse();
    expect(wrapperComponent.passwordStrengthChangedFunc).toHaveBeenCalledWith(-3);
  });

  it('should display medium when the field is filled by one letter per case and one number', () => {
    fixture.detectChanges();

    setInput('s3K');

    expect(element.classList.contains('medium')).toBeTrue();

    setInput('');

    expect(element.classList.contains('medium')).toBeFalse();
    expect(wrapperComponent.passwordStrengthChangedFunc).toHaveBeenCalledWith(-2);
  });

  it('should display good when the field is filled by one letter per case and one number and one symbol', () => {
    fixture.detectChanges();

    setInput('s3K!');

    expect(element.classList.contains('good')).toBeTrue();

    setInput('');

    expect(element.classList.contains('good')).toBeFalse();
    expect(wrapperComponent.passwordStrengthChangedFunc).toHaveBeenCalledWith(-1);
  });

  it('should display strong when the field is filled by letters of both cases and one number and one symbol and length of 8', () => {
    fixture.detectChanges();

    setInput('s3K!TEst');

    expect(element.classList.contains('strong')).toBeTrue();

    setInput('');

    expect(element.classList.contains('strong')).toBeFalse();
    expect(wrapperComponent.passwordStrengthChangedFunc).toHaveBeenCalledWith(0);
  });

  it('should not allow whitespaces by default', () => {
    fixture.detectChanges();

    setInput('s3K! TEst');
    expect(element.classList.length).toEqual(0);
  });

  it('should allow whitespaces when configured', () => {
    wrapperComponent.passwordStrengthConfig = { ...passwordStrengthValue, allowWhitespace: true };
    fixture.detectChanges();

    setInput('s3K! TEst');
    expect(element.classList.contains('strong')).toBeTrue();
  });

  it('should allow setting minRequiredPolicies', () => {
    wrapperComponent.passwordStrengthConfig = { ...passwordStrengthValue, minRequiredPolicies: 3 };
    fixture.detectChanges();

    // skip the uppercase
    setInput('s3K!test');
    expect(element.classList.contains('strong')).toBeTrue();
  });

  it('should show the icon, toggle', fakeAsync(() => {
    fixture.detectChanges();

    const icon = element.querySelector('button')!;
    expect(icon).toBeTruthy();
    expect(element.querySelector('si-password-toggle')?.classList).toContain(
      'show-visibility-icon'
    );
    expect(element.querySelector<HTMLElement>('input')?.getAttribute('type')).toBe('password');

    element.querySelector('button')?.click();
    tick();
    fixture.detectChanges();

    expect(element.querySelector<HTMLElement>('input')?.getAttribute('type')).toBe('text');
  }));
});
