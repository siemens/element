/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiIconModule } from '@siemens/element-ng/icon';

import { SiIconStatusComponent as TestComponent } from './si-icon-status.component';

describe('SiIconStatusComponent', () => {
  let component: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const checkCount = (c: number): void => {
    const count = parseInt(element.querySelector('span:not(.icon-stack)')?.innerHTML ?? '-1', 10);
    expect(count).toEqual(c);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiIconModule, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    element = fixture.nativeElement;
    component.setInput('icon', '');
  });

  it('should create the component', () => {
    component.setInput('count', 1);
    fixture.detectChanges();
    expect(component).toBeTruthy();
    checkCount(1);
  });

  it('should hide the count when the element is disabled', () => {
    component.setInput('disabled', true);
    fixture.detectChanges();
    checkCount(-1);
  });

  it('should set the count to 0 if nothing has been set', () => {
    fixture.detectChanges();
    checkCount(0);
  });

  it('should apply inactive if the count is 0', () => {
    component.setInput('count', 0);
    fixture.detectChanges();
    expect(element.querySelector('si-icon-next')?.classList).toContain('inactive');
  });

  it('should NOT apply inactive if the count > 0', () => {
    component.setInput('count', 1);
    fixture.detectChanges();
    expect(element.querySelector('si-icon-next')?.classList).not.toContain('inactive');
    checkCount(1);
  });

  it('should apply inactive if element is disabled', () => {
    component.setInput('disabled', true);
    fixture.detectChanges();
    expect(element.querySelector('si-icon-next')?.classList).toContain('inactive');
  });
});
