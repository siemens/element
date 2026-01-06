/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiIconLegacyComponent as TestComponent } from './si-icon-legacy.component';

describe('SiIconComponent', () => {
  let component: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
  });

  it('should set icon class', () => {
    component.setInput('icon', 'element-person');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.element-person');
    const aria = fixture.nativeElement.querySelector('span')!.getAttribute('aria-label');
    expect(icon.classList).toContain('element-person');
    expect(aria).toBe('person');
  });

  it('should set color class', () => {
    component.setInput('icon', 'element-alarm');
    component.setInput('color', 'element-text-active');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.element-alarm');
    expect(icon.classList).toContain('element-text-active');
  });

  it('should set alt text', () => {
    component.setInput('alt', 'alternative text');
    fixture.detectChanges();
    const aria = fixture.nativeElement.querySelector('span')!.getAttribute('aria-label');
    expect(aria).toContain('alternative text');
  });

  it('should set size', () => {
    component.setInput('icon', 'element-alarm');
    component.setInput('size', 'display-xl');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.display-xl');
    expect(icon.classList).toContain('display-xl');
  });

  it('should set stackedIcon and stackedColor', () => {
    component.setInput('stackedIcon', 'element-alarm-tick');
    component.setInput('stackedColor', 'text-secondary');
    fixture.detectChanges();
    const stackIcon = fixture.nativeElement.querySelector('i:first-child');
    expect(stackIcon.classList).toContain('element-alarm-tick');
    expect(stackIcon.classList).toContain('text-secondary');
  });

  it('should create composite icon', () => {
    component.setInput('icon', 'element-alarm-background-filled');
    component.setInput('color', 'status-danger');
    component.setInput('stackedIcon', 'element-alarm-tick');
    component.setInput('stackedColor', 'text-secondary');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('span');
    expect(icon.classList).toContain('element-alarm-background-filled');
    expect(icon.classList).toContain('status-danger');
    const stackIcon = fixture.nativeElement.querySelector('i');
    expect(stackIcon.classList).toContain('element-alarm-tick');
    expect(stackIcon.classList).toContain('text-secondary');
    const wrapper = fixture.nativeElement.querySelector('span');
    expect(wrapper.getAttribute('aria-label')).toContain('alarm background filled');
  });
});
