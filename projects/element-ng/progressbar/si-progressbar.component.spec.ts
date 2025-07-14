/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiProgressbarComponent as TestComponent } from './si-progressbar.component';

describe('SiProgressbarComponent', () => {
  let componentRef: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, TestComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    componentRef = fixture.componentRef;
  });

  it('should work correctly with default values', () => {
    element = fixture.nativeElement;
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement?.getAttribute('aria-valuemin')).toEqual('0');
    expect(progressElement?.getAttribute('aria-valuenow')).toEqual('0');
    expect(progressElement?.getAttribute('aria-valuemax')).toEqual('100');
    expect(progressElement?.getAttribute('aria-valuetext')).toEqual('0%');
    expect(progressElement?.getAttribute('aria-label')).toEqual('Progress');
  });

  it('should set value to 10 and all corresponding attributes', () => {
    element = fixture.nativeElement;
    componentRef.setInput('value', 10);
    componentRef.setInput('max', 200);
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement?.getAttribute('aria-valuemin')).toEqual('0');
    expect(progressElement?.getAttribute('aria-valuenow')).toEqual('10');
    expect(progressElement?.getAttribute('aria-valuemax')).toEqual('200');
    expect(progressElement?.getAttribute('aria-valuetext')).toEqual('5%');
    expect(progressElement?.getAttribute('aria-label')).toEqual('Progress');
  });

  it('should be able to handle more than 100%', () => {
    element = fixture.nativeElement;
    componentRef.setInput('value', 201);
    componentRef.setInput('max', 200);
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement?.getAttribute('aria-valuemin')).toEqual('0');
    expect(progressElement?.getAttribute('aria-valuenow')).toEqual('201');
    expect(progressElement?.getAttribute('aria-valuemax')).toEqual('200');
    expect(progressElement?.getAttribute('aria-valuetext')).toEqual('101%');
    expect(progressElement?.getAttribute('aria-label')).toEqual('Progress');
  });

  it('should set the right percentage', () => {
    element = fixture.nativeElement;
    componentRef.setInput('value', 126);
    componentRef.setInput('max', 300);
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement?.getAttribute('aria-valuetext')).toEqual('42%');
  });

  it('should set aria-label', () => {
    element = fixture.nativeElement;
    componentRef.setInput('ariaLabel', 'Test');
    fixture.detectChanges();
    const progressElement = element.querySelector('div.progress-bar');
    expect(progressElement?.getAttribute('aria-label')).toEqual('Test');
  });

  it('should display title if set', () => {
    element = fixture.nativeElement;
    componentRef.setInput('heading', 'Test Title');
    fixture.detectChanges();
    expect((element.querySelector('span.si-title-2') as HTMLSpanElement)?.innerText).toBe(
      'Test Title'
    );
  });
});
