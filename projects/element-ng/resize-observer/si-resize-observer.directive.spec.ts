/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockInstance } from 'vitest';

import { ElementDimensions } from './index';
import { SiResizeObserverDirective } from './si-resize-observer.directive';
import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from './testing/resize-observer.mock';

@Component({
  imports: [SiResizeObserverDirective],
  template: `
    <div
      #theDiv
      [style.width.px]="width()"
      [style.height.px]="height()"
      [emitInitial]="emitInitial()"
      (siResizeObserver)="resizeHandler($event)"
    >
      Testli
    </div>
  `
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef<HTMLElement>>('theDiv');
  readonly width = signal(100);
  readonly height = signal(100);
  readonly emitInitial = signal(true);

  resizeHandler(dim: ElementDimensions): void {}
}

describe('SiResizeObserverDirective', () => {
  let component: TestHostComponent;
  let spy: MockInstance;

  const resize = (width: number, height: number): void => {
    component.width.set(width);
    component.height.set(height);
    TestBed.tick();
    MockResizeObserver.triggerResize({});
  };

  beforeEach(async () => {
    mockResizeObserver();
    const fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = vi.spyOn(component, 'resizeHandler');
    vi.useFakeTimers();
    await fixture.whenStable();
  });

  afterEach(() => {
    restoreResizeObserver();
    vi.useRealTimers();
  });

  it('emits initial size event asynchronously', () => {
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 100 });
  });

  it('emits on width change', () => {
    vi.advanceTimersByTime(0);
    spy.mockClear();
    resize(200, 100);
    vi.advanceTimersByTime(99);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('emits on height change', () => {
    vi.advanceTimersByTime(0);
    spy.mockClear();
    resize(100, 200);
    vi.advanceTimersByTime(99);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 200 });
  });
});

describe('SiResizeObserverDirective with emitInitial=false', () => {
  let spy: MockInstance;

  beforeEach(async () => {
    mockResizeObserver();
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.emitInitial.set(false);
    spy = vi.spyOn(fixture.componentInstance, 'resizeHandler');
    vi.useFakeTimers();
    await fixture.whenStable();
  });

  afterEach(() => {
    restoreResizeObserver();
    vi.useRealTimers();
  });

  it('does not emit initial size event', () => {
    vi.advanceTimersByTime(100);
    expect(spy).not.toHaveBeenCalled();
  });
});
