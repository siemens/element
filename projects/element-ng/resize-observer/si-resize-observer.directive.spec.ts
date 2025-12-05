/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ElementRef,
  provideZonelessChangeDetection,
  signal,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mock, vi } from 'vitest';

import { ElementDimensions } from './index';
import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from './mock-resize-observer.spec';
import { SiResizeObserverDirective } from './si-resize-observer.directive';

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
  let spy: Mock;

  const detectSizeChange = (inlineSize: number = 100, blockSize: number = 100): void => {
    component.width.set(inlineSize);
    component.height.set(blockSize);
    fixture.detectChanges();
    MockResizeObserver.triggerResize({});
    fixture.detectChanges();
  };

  beforeEach(() => {
    mockResizeObserver();
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = vi.spyOn(component, 'resizeHandler');
  });

  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
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
    // not interested in the initial event
    spy.mockClear();
    detectSizeChange(200, 100);

    expect(component.resizeHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('emits on height change', async () => {
    // not interested in the initial event
    spy.mockClear();

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
  let spy: Mock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.emitInitial = false;
    spy = vi.spyOn(component, 'resizeHandler');
    fixture.detectChanges();
  });

  it('does not emit initial size event', () => {
    expect(spy).not.toHaveBeenCalled();
  });
});
