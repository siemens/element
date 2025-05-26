/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiConnectionStrengthComponent as TestComponent } from './index';

describe('SiConnectionStrengthComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent]
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

      expect(element.querySelector('svg')!.classList.contains('none')).toBeTrue();
    });

    it('should display other value', () => {
      component.setInput('value', 'low');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBeFalse();
    });
  });

  describe('with wlan', () => {
    beforeEach(() => {
      component.setInput('wlan', true);
    });

    it('should display none value', () => {
      component.setInput('value', 'none');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBeTrue();
    });

    it('should display other value', () => {
      component.setInput('value', 'low');
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBeFalse();
    });

    it('should display none if an incorrect value is set', () => {
      component.setInput('value', undefined);
      fixture.detectChanges();

      expect(element.querySelector('svg')!.classList.contains('none')).toBeTrue();
    });
  });
});
