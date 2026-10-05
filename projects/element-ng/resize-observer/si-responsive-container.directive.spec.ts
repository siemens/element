/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { SiResponsiveContainerDirective } from './index';

@Component({
  imports: [SiResponsiveContainerDirective],
  template: `
    <div
      siResponsiveContainer
      class="vh-100 w-100"
      [resizeThrottle]="10"
      [style.width.px]="width()"
    >
      Testli
    </div>
  `
})
class TestHostComponent {
  readonly width = signal(100);
}

describe('SiResponsiveContainerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await page.viewport(100, 100);
    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const testSize = async (size: string | number, clazz: string | number): Promise<void> => {
    const container = element.querySelector<HTMLElement>('div')!;
    const expectedClass = clazz.toString();
    const classChanged = new Promise<void>(resolve => {
      if (container.classList.contains(expectedClass)) {
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        if (container.classList.contains(expectedClass)) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(container, { attributes: true, attributeFilter: ['class'] });
    });

    await page.viewport(parseInt(size as string, 10), 100);
    await fixture.whenStable();
    await classChanged;

    expect(container).toHaveClass(expectedClass);
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
