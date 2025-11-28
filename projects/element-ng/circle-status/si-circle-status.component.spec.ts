/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ComponentRef,
  provideZonelessChangeDetection,
  SimpleChange
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiCircleStatusComponent, SiCircleStatusComponent as TestComponent } from './index';

describe('SiCircleStatusComponent', () => {
  let component: TestComponent;
  let componentRef: ComponentRef<TestComponent>;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const checkAriaLabel = (label: string): void =>
    expect(element.querySelector('.status-indication')?.getAttribute('aria-label')).toBe(label);

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    })
      // because of https://github.com/angular/angular/issues/12313
      .overrideComponent(SiCircleStatusComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should not set icon class, if no icon is configured', () => {
    componentRef.setInput('icon', undefined);
    componentRef.setInput('status', component.status());
    fixture.detectChanges();
    expect(element.querySelector('.status-indication-icon')).not.toBeTruthy();
    checkAriaLabel('status none');
  });

  it('should set configured icon class', () => {
    const iconClass = 'element-door';
    componentRef.setInput('icon', iconClass);
    componentRef.setInput('status', 'info');
    fixture.detectChanges();
    expect(element.querySelector('.element-door')).toBeDefined();
    checkAriaLabel('door in status info');
  });

  it('set aria-label according to status and icon', () => {
    const iconClass = 'element-door';
    componentRef.setInput('icon', iconClass);
    componentRef.setInput('status', 'info');
    fixture.detectChanges();
    checkAriaLabel('door in status info');
  });

  it('set passed aria-label', () => {
    componentRef.setInput('ariaLabel', 'icon description');
    componentRef.setInput('status', component.status());
    fixture.detectChanges();
    checkAriaLabel('icon description');
  });

  it('set blink to true', async () => {
    componentRef.setInput('blink', true);
    componentRef.setInput('status', 'info');
    component.ngOnChanges({
      blink: new SimpleChange(false, true, true),
      status: new SimpleChange(undefined, component.status(), false)
    });
    fixture.detectChanges();
    const statusIndication = element.querySelector('.status-indication .bg') as HTMLElement;
    expect(statusIndication.classList.contains('pulse')).toBeFalse();
    await new Promise(r => setTimeout(r, 1400));
    fixture.detectChanges();
    expect(statusIndication.classList.contains('pulse')).toBeTrue();
    component.ngOnDestroy();
  });

  it('should show event out indication', () => {
    componentRef.setInput('eventOut', true);
    fixture.detectChanges();

    const outElement = element.querySelector('.event-out');
    expect(outElement).toBeTruthy();
  });
});
