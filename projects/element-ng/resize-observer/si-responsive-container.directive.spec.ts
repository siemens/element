/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
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

  const testSize = async (size: string | number, clazz: string | number): Promise<void> => {
    vi.useFakeTimers();
    await page.viewport(parseInt(size as string, 10), 100);

    vi.advanceTimersByTime(100);
    await fixture.whenStable();

    expect(element.querySelector<HTMLElement>('div')!).toHaveClass(clazz.toString());
    vi.useRealTimers();
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
