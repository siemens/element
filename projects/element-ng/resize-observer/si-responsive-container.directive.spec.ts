/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiResponsiveContainerDirective } from './index';
import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from './testing/resize-observer.mock';

@Component({
  imports: [SiResponsiveContainerDirective],
  template: `
    <div siResponsiveContainer [resizeThrottle]="10" [style.width.px]="width()">Testli</div>
  `
})
class TestHostComponent {
  readonly width = signal(100);
}

describe('SiResponsiveContainerDirective', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    mockResizeObserver();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    // after createComponent so Angular's initial change detection is scheduled with real timers
    vi.useFakeTimers();
    await fixture.whenStable();
    // flush the initial size emission
    vi.advanceTimersByTime(0);
  });

  afterEach(() => {
    restoreResizeObserver();
    vi.useRealTimers();
  });

  const testSize = (size: number, clazz: string): void => {
    component.width.set(size);
    TestBed.tick();
    MockResizeObserver.triggerResize({});
    vi.advanceTimersByTime(10);
    TestBed.tick();

    expect(element.querySelector<HTMLElement>('div')!).toHaveClass(clazz);
  };

  it.for([
    [100, 'si-container-xs'],
    [580, 'si-container-sm'],
    [780, 'si-container-md'],
    [1000, 'si-container-lg'],
    [1200, 'si-container-xl']
  ] as const)('width %i sets %s class', ([size, expected]) => {
    testSize(size, expected);
  });
});
