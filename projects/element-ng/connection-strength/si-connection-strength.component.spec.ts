/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStrength, SiConnectionStrengthComponent as TestComponent } from './index';

describe('SiConnectionStrengthComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let wlan: WritableSignal<boolean>;
  let value: WritableSignal<ConnectionStrength>;

  beforeEach(() => {
    wlan = signal(false);
    value = signal<ConnectionStrength>('none');

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('wlan', wlan), inputBinding('value', value)]
    });
    element = fixture.nativeElement;
  });

  describe('normal', () => {
    beforeEach(() => {
      wlan.set(false);
    });

    it('should display none value', async () => {
      value.set('none');
      await fixture.whenStable();

      expect(element.querySelector('svg')!).toHaveClass('none');
    });

    it('should display other value', async () => {
      value.set('low');
      await fixture.whenStable();

      expect(element.querySelector('svg')!).not.toHaveClass('none');
    });
  });

  describe('with wlan', () => {
    beforeEach(() => {
      wlan.set(true);
    });

    it('should display none value', async () => {
      value.set('none');
      await fixture.whenStable();

      expect(element.querySelector('svg')!).toHaveClass('none');
    });

    it('should display other value', async () => {
      value.set('low');
      await fixture.whenStable();

      expect(element.querySelector('svg')!).not.toHaveClass('none');
    });

    it('should display none if an incorrect value is set', async () => {
      value.set(undefined as any);
      await fixture.whenStable();

      expect(element.querySelector('svg')!).toHaveClass('none');
    });
  });
});
