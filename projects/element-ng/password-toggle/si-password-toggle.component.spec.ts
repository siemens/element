/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { SiPasswordToggleModule } from './si-password-toggle.module';

@Component({
  imports: [FormsModule, SiPasswordToggleModule],
  template: `
    <si-password-toggle #toggle [showVisibilityIcon]="showVisibilityIcon()">
      <input [attr.type]="toggle.inputType" />
    </si-password-toggle>
  `
})
class TestHostComponent {
  readonly showVisibilityIcon = input(true);
}

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiPasswordToggleModule],
  template: `
    <form [formGroup]="form">
      <si-password-toggle #toggle [showVisibilityIcon]="true">
        <input class="form-control" formControlName="input" />
      </si-password-toggle>
    </form>
  `
})
class FormHostComponent {
  readonly form = new FormGroup({
    input: new FormControl('', { updateOn: 'blur', validators: Validators.required })
  });
}

describe('SiPasswordToggleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SiPasswordToggleModule, TestHostComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should show the icon, toggle', () => {
    fixture.detectChanges();

    const icon = element.querySelector('button')!;
    expect(icon).toBeInTheDocument();
    expect(element.querySelector('si-password-toggle')).toHaveClass('show-visibility-icon');
    expect(element.querySelector('input')).toHaveAttribute('type', 'password');

    element.querySelector('button')?.click();

    fixture.detectChanges();

    expect(element.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('should hide the icon when disabled', () => {
    fixture.componentRef.setInput('showVisibilityIcon', false);
    fixture.detectChanges();

    const icon = element.querySelector('button')!;
    expect(icon).not.toBeInTheDocument();
    expect(element.querySelector('si-password-toggle')).not.toHaveClass('show-visibility-icon');
  });

  describe('as form control', () => {
    let formFixture: ComponentFixture<FormHostComponent>;

    beforeEach(() => {
      formFixture = TestBed.createComponent(FormHostComponent);
      formFixture.detectChanges();
      element = formFixture.nativeElement;
    });

    it('should show invalid border on blur', async () => {
      const passwordInput = element.querySelector<HTMLElement>('input')!;
      expect(passwordInput).not.toHaveClass('ng-touched');
      expect(passwordInput).toHaveClass('ng-invalid');

      passwordInput.dispatchEvent(new Event('blur'));
      formFixture.detectChanges();
      await formFixture.whenStable();

      expect(passwordInput).toHaveClass('ng-touched');
      expect(passwordInput).toHaveClass('ng-invalid');
    });
  });
});
