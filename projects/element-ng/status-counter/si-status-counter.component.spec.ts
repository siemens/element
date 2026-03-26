/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiStatusCounterComponent } from './si-status-counter.component';

describe('SiStatusCounterComponent', () => {
  let fixture: ComponentFixture<SiStatusCounterComponent>;
  let element: HTMLElement;
  let icon: WritableSignal<string>;
  let count: WritableSignal<number>;
  let disabled: WritableSignal<boolean>;

  const checkCount = (c: number): void => {
    const countValue = parseInt(
      element.querySelector('span:not(.icon-stack)')?.innerHTML ?? '-1',
      10
    );
    expect(countValue).toEqual(c);
  };

  beforeEach(() => {
    icon = signal('');
    count = signal(0);
    disabled = signal(false);
    fixture = TestBed.createComponent(SiStatusCounterComponent, {
      bindings: [
        inputBinding('icon', icon),
        inputBinding('count', count),
        inputBinding('disabled', disabled)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should create the component', async () => {
    count.set(1);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
    checkCount(1);
  });

  it('should hide the count when the element is disabled', async () => {
    disabled.set(true);
    await fixture.whenStable();
    checkCount(-1);
  });

  it('should set the count to 0 if nothing has been set', async () => {
    await fixture.whenStable();
    checkCount(0);
  });

  it('should apply inactive if the count is 0', async () => {
    count.set(0);
    await fixture.whenStable();
    expect(element.querySelector('si-icon')).toHaveClass('inactive');
  });

  it('should NOT apply inactive if the count > 0', async () => {
    count.set(1);
    await fixture.whenStable();
    expect(element.querySelector('si-icon')).not.toHaveClass('inactive');
    checkCount(1);
  });

  it('should apply inactive if element is disabled', async () => {
    disabled.set(true);
    await fixture.whenStable();
    expect(element.querySelector('si-icon')).toHaveClass('inactive');
  });
});
