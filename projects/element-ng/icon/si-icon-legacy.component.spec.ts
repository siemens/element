/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiIconLegacyComponent as TestComponent } from './si-icon-legacy.component';

describe('SiIconLegacyComponent', () => {
  let component: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
  });

  it('should set icon class', () => {
    component.setInput('icon', 'element-person');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.element-person');
    expect(icon).toHaveClass('element-person');
    expect(fixture.nativeElement.querySelector('span')).toHaveAttribute('aria-label', 'person');
  });

  it('should set color class', () => {
    component.setInput('icon', 'element-alarm');
    component.setInput('color', 'element-text-active');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.element-alarm');
    expect(icon).toHaveClass('element-text-active');
  });

  it('should set alt text', () => {
    component.setInput('alt', 'alternative text');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('alternative text')
    );
  });

  it('should set size', () => {
    component.setInput('icon', 'element-alarm');
    component.setInput('size', 'display-xl');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.display-xl');
    expect(icon).toHaveClass('display-xl');
  });

  it('should set stackedIcon and stackedColor', () => {
    component.setInput('stackedIcon', 'element-alarm-tick');
    component.setInput('stackedColor', 'text-secondary');
    fixture.detectChanges();
    const stackIcon = fixture.nativeElement.querySelector('i:first-child');
    expect(stackIcon).toHaveClass('element-alarm-tick');
    expect(stackIcon).toHaveClass('text-secondary');
  });

  it('should create composite icon', () => {
    component.setInput('icon', 'element-alarm-background-filled');
    component.setInput('color', 'status-danger');
    component.setInput('stackedIcon', 'element-alarm-tick');
    component.setInput('stackedColor', 'text-secondary');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('span');
    expect(icon).toHaveClass('element-alarm-background-filled');
    expect(icon).toHaveClass('status-danger');
    const stackIcon = fixture.nativeElement.querySelector('i');
    expect(stackIcon).toHaveClass('element-alarm-tick');
    expect(stackIcon).toHaveClass('text-secondary');
    const wrapper = fixture.nativeElement.querySelector('span');
    expect(wrapper).toHaveAttribute(
      'aria-label',
      expect.stringContaining('alarm background filled')
    );
  });
});
