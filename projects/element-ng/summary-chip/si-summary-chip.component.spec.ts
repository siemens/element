/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SiSummaryChipComponent } from './index';

describe('SiSummaryChipComponent', () => {
  let componentRef: ComponentRef<SiSummaryChipComponent>;
  let fixture: ComponentFixture<SiSummaryChipComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiSummaryChipComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SiSummaryChipComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('label', 'test label');
    componentRef.setInput('value', '42');
    element = fixture.nativeElement;
  });

  it('should set label and value', () => {
    fixture.detectChanges();

    expect(element.querySelector('.si-body')?.textContent).toContain('test label');
    expect(element.querySelector('.si-h5')?.textContent).toContain('42');
    expect(element.querySelector('si-icon')).toBeFalsy();
  });

  it('should hide label when requested', () => {
    componentRef.setInput('icon', 'element-not-checked');
    componentRef.setInput('hideLabel', 'true');
    fixture.detectChanges();

    expect(element.querySelector('.si-body')?.textContent).toContain('test label');
    expect(element.querySelector('.si-body')?.classList.contains('visually-hidden')).toBe(true);
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
});
