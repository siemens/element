/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiPasswordToggleModule } from './si-password-toggle.module';

@Component({
  imports: [FormsModule, SiPasswordToggleModule, SiTranslateModule],
  template: `
    <si-password-toggle #toggle [showVisibilityIcon]="showVisibilityIcon()">
      <input [attr.type]="toggle.inputType" />
    </si-password-toggle>
  `
})
class TestHostComponent {
  readonly showVisibilityIcon = input(true);
}

describe('SiPasswordToggleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SiPasswordToggleModule, SiTranslateModule, TestHostComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
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

  it('should hide the icon when disabled', () => {
    fixture.componentRef.setInput('showVisibilityIcon', false);
    fixture.detectChanges();

    const icon = element.querySelector('button')!;
    expect(icon).toBeFalsy();
    expect(element.querySelector('si-password-toggle')?.classList).not.toContain(
      'show-visibility-icon'
    );
  });
});
