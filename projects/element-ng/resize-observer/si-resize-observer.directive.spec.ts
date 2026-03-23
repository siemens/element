/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      [emitInitial]="emitInitial"
      (siResizeObserver)="resizeHandler($event)"
    >
      Testli
    </div>
  `
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
  readonly width = signal(100);
  readonly height = signal(100);
  emitInitial = true;

  resizeHandler(dim: ElementDimensions): void {}
}

describe('SiResizeObserverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: MockInstance;

  const detectSizeChange = (inlineSize: number = 100, blockSize: number = 100): void => {
    component.width.set(inlineSize);
    component.height.set(blockSize);
    fixture.detectChanges();
    MockResizeObserver.triggerResize({});
    fixture.detectChanges();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockResizeObserver();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = vi.spyOn(component, 'resizeHandler');
  });

  afterEach(() => {
    spy.mockClear();
    restoreResizeObserver();
    vi.useRealTimers();
  });

  it('emits initial size event', async () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(100);
    await fixture.whenStable();
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 100 });
  });

  it('emits on width change', async () => {
    detectSizeChange(200, 100);

    expect(component.resizeHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('emits on height change', async () => {
    detectSizeChange(100, 200);

    expect(component.resizeHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 200 });
  });
});

describe('SiResizeObserverDirective with emitInitial=false', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: MockInstance;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.emitInitial = false;
    spy = vi.spyOn(component, 'resizeHandler');
    fixture.detectChanges();
  });

  afterEach(() => {
    spy.mockClear();
  });

  it('does not emit initial size event', () => {
    expect(spy).not.toHaveBeenCalled();
  });
});
