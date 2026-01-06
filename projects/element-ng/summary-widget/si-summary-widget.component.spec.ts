/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSummaryWidgetComponent } from './index';

describe('SiSummaryWidgetComponent', () => {
  let componentRef: ComponentRef<SiSummaryWidgetComponent>;
  let fixture: ComponentFixture<SiSummaryWidgetComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiSummaryWidgetComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SiSummaryWidgetComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('label', 'test label');
    componentRef.setInput('value', '42');
    element = fixture.nativeElement;
  });

  it('should set label and value', () => {
    fixture.detectChanges();

    expect(element.querySelector('.text-secondary')?.textContent).toContain('test label');
    expect(element.querySelector('.si-h5')?.textContent).toContain('42');
    expect(element.querySelector('si-icon')).toBeFalsy();
  });

  it('should display custom icon', () => {
    componentRef.setInput('icon', 'element-manual-filled');
    componentRef.setInput('color', 'status-warning');
    fixture.detectChanges();

    expect(element.querySelector('si-icon div')!.classList.contains('element-manual-filled')).toBe(
      true
    );
    expect(element.querySelector('si-icon')!.classList.contains('status-warning')).toBe(true);
  });

  it('should display selected state', () => {
    componentRef.setInput('selected', true);
    fixture.detectChanges();

    expect(element.querySelector('.selected')).toBeTruthy();
  });

  it('should toggle selected state on click', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe(false);

    element.querySelector('div')?.click();
    expect(fixture.componentInstance.selected()).toBe(true);
  });

  it('should not toggle selected state on click when disabled', () => {
    componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe(false);

    element.querySelector('div')?.click();
    expect(fixture.componentInstance.selected()).toBe(false);
  });

  it('should not toggle selected state on click when readonly', () => {
    componentRef.setInput('readonly', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe(false);

    element.querySelector('div')?.click();
    expect(fixture.componentInstance.selected()).toBe(false);
  });
});
