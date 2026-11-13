/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resetViewport } from '@siemens/element-ng/test-helpers';
import { page } from 'vitest/browser';

import { SiResponsiveContainerDirective } from './index';

@Component({
  imports: [SiResponsiveContainerDirective],
  template: ` <div siResponsiveContainer class="vh-100 w-100" [resizeThrottle]="10">Testli</div> `
})
class TestHostComponent {}

describe('SiResponsiveContainerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await page.viewport(100, 100);
    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement;
  });

  afterEach(async () => {
    vi.useRealTimers();
    await resetViewport();
  });

  const testSize = async (size: string | number, clazz: string | number): Promise<void> => {
    vi.useFakeTimers();
    await page.viewport(parseInt(size as string, 10), 100);

    vi.advanceTimersByTime(100);
    await fixture.whenStable();

    expect(element.querySelector<HTMLElement>('div')!).toHaveClass(clazz.toString());
  };

  it.for([
    [100, 'si-container-xs'],
    [580, 'si-container-sm'],
    [780, 'si-container-md'],
    [1000, 'si-container-lg'],
    [1200, 'si-container-xl']
  ])('width %i sets %s class', async ([size, expected]) => {
    await testSize(size, expected);
  });
});
