/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiProgressbarComponent as TestComponent } from './si-progressbar.component';

describe('SiProgressbarComponent', () => {
  let componentRef: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    componentRef = fixture.componentRef;
  });

  it('should work correctly with default values', () => {
    element = fixture.nativeElement;
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement).toHaveAttribute('aria-valuemin', '0');
    expect(progressElement).toHaveAttribute('aria-valuenow', '0');
    expect(progressElement).toHaveAttribute('aria-valuemax', '100');
    expect(progressElement).toHaveAttribute('aria-valuetext', '0%');
    expect(progressElement).toHaveAttribute('aria-label', 'Progress');
  });

  it('should set value to 10 and all corresponding attributes', () => {
    element = fixture.nativeElement;
    componentRef.setInput('value', 10);
    componentRef.setInput('max', 200);
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement).toHaveAttribute('aria-valuemin', '0');
    expect(progressElement).toHaveAttribute('aria-valuenow', '10');
    expect(progressElement).toHaveAttribute('aria-valuemax', '200');
    expect(progressElement).toHaveAttribute('aria-valuetext', '5%');
    expect(progressElement).toHaveAttribute('aria-label', 'Progress');
  });

  it('should be able to handle more than 100%', () => {
    element = fixture.nativeElement;
    componentRef.setInput('value', 201);
    componentRef.setInput('max', 200);
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement).toHaveAttribute('aria-valuemin', '0');
    expect(progressElement).toHaveAttribute('aria-valuenow', '201');
    expect(progressElement).toHaveAttribute('aria-valuemax', '200');
    expect(progressElement).toHaveAttribute('aria-valuetext', '101%');
    expect(progressElement).toHaveAttribute('aria-label', 'Progress');
  });

  it('should set the right percentage', () => {
    element = fixture.nativeElement;
    componentRef.setInput('value', 126);
    componentRef.setInput('max', 300);
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement).toHaveAttribute('aria-valuetext', '42%');
  });

  it('should set aria-label', () => {
    element = fixture.nativeElement;
    componentRef.setInput('ariaLabel', 'Test');
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement).toHaveAttribute('aria-label', 'Test');
  });

  it('should display title if set', () => {
    element = fixture.nativeElement;
    componentRef.setInput('heading', 'Test Title');
    fixture.detectChanges();
    expect(element.querySelector('span.si-h5')).toHaveTextContent('Test Title');
  });
});
