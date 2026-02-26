/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiEmptyStateComponent as TestComponent } from '.';

describe('SiEmptyStateComponent', () => {
  let componentRef: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    componentRef = fixture.componentRef;
    element = fixture.nativeElement;
  });

  it('should display the correct data', () => {
    componentRef.setInput('heading', 'No Devices');
    componentRef.setInput('content', 'No devices were detected. Please retry!');
    componentRef.setInput('icon', 'element-icon');
    fixture.detectChanges();

    expect(element.querySelector('h3')!.innerText).toBe('No Devices');
    expect(element.querySelector('p')!.innerText).toBe('No devices were detected. Please retry!');
    expect(element.querySelector('.element-icon')!.innerHTML).toBeDefined();
  });

  it('should not render icon or description when not provided', () => {
    componentRef.setInput('heading', 'No Devices');
    fixture.detectChanges();

    expect(element.querySelector('si-icon')).toBeNull();
    expect(element.querySelector('p.text-pre-wrap')).toBeNull();
  });
});
