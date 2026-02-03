/**
 * Copyright (c) Siemens 2016 - 2025
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

const rgbToHex = (rgb: string): string => {
  const result = rgb.match(/\d+/g);
  if (!result) return rgb;
  const [r, g, b] = result.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

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
      <si-password-toggle #toggle showVisibilityIcon="true">
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
    expect(icon).toBeTruthy();
    expect(element.querySelector('si-password-toggle')?.classList).toContain(
      'show-visibility-icon'
    );
    expect(element.querySelector<HTMLElement>('input')?.getAttribute('type')).toBe('password');

    element.querySelector('button')?.click();

    fixture.detectChanges();

    expect(element.querySelector<HTMLElement>('input')?.getAttribute('type')).toBe('text');
  });

  it('should hide the icon when disabled', () => {
    fixture.componentRef.setInput('showVisibilityIcon', false);
    fixture.detectChanges();

    const icon = element.querySelector('button')!;
    expect(icon).toBeFalsy();
    expect(element.querySelector('si-password-toggle')?.classList).not.toContain(
      'show-visibility-icon'
    );
  });

  describe('as form control', () => {
    let formFixture: ComponentFixture<FormHostComponent>;

    beforeEach(() => {
      formFixture = TestBed.createComponent(FormHostComponent);
      formFixture.detectChanges();
      element = formFixture.nativeElement;
    });

    it('should show invalid border on blur', () => {
      const passwordInput = element.querySelector<HTMLElement>('input')!;
      const defaultBorderColor = getComputedStyle(passwordInput).getPropertyValue('--element-ui-2');
      const invalidBorderColor =
        getComputedStyle(passwordInput).getPropertyValue('--element-status-danger');

      expect(rgbToHex(getComputedStyle(passwordInput).borderColor)).toBe(defaultBorderColor);

      passwordInput.dispatchEvent(new Event('blur'));
      formFixture.detectChanges();
      expect(rgbToHex(getComputedStyle(passwordInput).borderColor)).toBe(invalidBorderColor);
    });
  });
});
