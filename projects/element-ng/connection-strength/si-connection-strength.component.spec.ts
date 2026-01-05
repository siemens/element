/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiConnectionStrengthComponent as TestComponent } from './index';

describe('SiConnectionStrengthComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    element = fixture.nativeElement;
  });

  describe('normal', () => {
    beforeEach(() => {
      component.setInput('wlan', false);
    });

    it('should display none value', () => {
      component.setInput('value', 'none');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBe(true);
    });

    it('should display other value', () => {
      component.setInput('value', 'low');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBe(false);
    });
  });

  describe('with wlan', () => {
    beforeEach(() => {
      component.setInput('wlan', true);
    });

    it('should display none value', () => {
      component.setInput('value', 'none');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBe(true);
    });

    it('should display other value', () => {
      component.setInput('value', 'low');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBe(false);
    });

    it('should display none if an incorrect value is set', () => {
      component.setInput('value', undefined);
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBe(true);
    });
  });
});
