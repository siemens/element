/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSummaryWidgetComponent } from './index';

describe('SiSummaryWidgetComponent', () => {
  let componentRef: ComponentRef<SiSummaryWidgetComponent>;
  let fixture: ComponentFixture<SiSummaryWidgetComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiSummaryWidgetComponent]
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
    expect(element.querySelector('.si-title-2')?.textContent).toContain('42');
    expect(element.querySelector('si-icon')).toBeFalsy();
  });

  it('should display custom icon', () => {
    componentRef.setInput('icon', 'element-manual-filled');
    componentRef.setInput('color', 'status-warning');
    fixture.detectChanges();

    expect(element.querySelector('si-icon span')).toHaveClass('element-manual-filled');
    expect(element.querySelector('si-icon span')).toHaveClass('status-warning');
  });

  it('should display selected state', () => {
    componentRef.setInput('selected', true);
    fixture.detectChanges();

    expect(element.querySelector('.selected')).toBeTruthy();
  });

  it('should toggle selected state on click', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBeFalse();

    element.querySelector('div')?.click();
    expect(fixture.componentInstance.selected()).toBeTrue();
  });

  it('should not toggle selected state on click when disabled', () => {
    componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBeFalse();

    element.querySelector('div')?.click();
    expect(fixture.componentInstance.selected()).toBeFalse();
  });

  it('should not toggle selected state on click when readonly', () => {
    componentRef.setInput('readonly', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBeFalse();

    element.querySelector('div')?.click();
    expect(fixture.componentInstance.selected()).toBeFalse();
  });
});
