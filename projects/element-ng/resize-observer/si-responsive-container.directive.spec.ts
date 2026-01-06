/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiResponsiveContainerDirective } from './index';
import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from './mock-resize-observer.spec';

@Component({
  imports: [SiResponsiveContainerDirective],
  template: `
    <div
      siResponsiveContainer
      style="width: 100px"
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
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() => {
    mockResizeObserver();
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  afterEach(() => restoreResizeObserver());

  const testSize = async (size: number, clazz: string): Promise<void> => {
    vi.useFakeTimers();
    component.width.set(size);
    fixture.detectChanges();
    MockResizeObserver.triggerResize({});

    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector<HTMLElement>('div')!.className).toBe(clazz);
    vi.useRealTimers();
  };

  it('sets correct si-container-* class', async () => {
    await testSize(100, 'si-container-xs');
    await testSize(580, 'si-container-sm');
    await testSize(780, 'si-container-md');
    await testSize(1000, 'si-container-lg');
    await testSize(1200, 'si-container-xl');
  });
});
