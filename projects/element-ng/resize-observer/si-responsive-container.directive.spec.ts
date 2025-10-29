/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

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
      imports: [TestHostComponent]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => restoreResizeObserver());

  const testSize = async (size: number, clazz: string): Promise<void> => {
    component.width.set(size);
    fixture.detectChanges();
    MockResizeObserver.triggerResize({});
    flush();
    fixture.detectChanges();

    expect(element.querySelector<HTMLElement>('div')!.className).toBe(clazz);
  };

  it('sets correct si-container-* class', fakeAsync(() => {
    testSize(100, 'si-container-xs');
    testSize(580, 'si-container-sm');
    testSize(780, 'si-container-md');
    testSize(1000, 'si-container-lg');
    testSize(1200, 'si-container-xl');
  }));
});
