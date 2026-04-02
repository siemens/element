/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { Mock } from 'vitest';

import { ElementDimensions, ResizeObserverService } from './resize-observer.service';
import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from './testing/resize-observer.mock';

@Component({
  template: `<div #theDiv [style.width.px]="width()" [style.height.px]="height()">Testli</div>`
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
  readonly width = signal(100);
  readonly height = signal(100);
}

describe('ResizeObserverService', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let service: ResizeObserverService;
  let subscription: Subscription;
  let spy: Mock<(dim: ElementDimensions) => void>;

  const subscribe = (initial: boolean): void => {
    subscription = service
      .observe(component.theDiv().nativeElement, 50, initial)
      .subscribe(dim => spy(dim));
  };

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
    service = TestBed.inject(ResizeObserverService);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spy = vi.fn();
  });

  afterEach(() => {
    subscription?.unsubscribe();
    restoreResizeObserver();
    vi.useRealTimers();
  });

  it('emits initial size event when asked', () => {
    subscribe(true);
    vi.advanceTimersByTime(10);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));
  });

  it('emits no initial size event when not asked', () => {
    subscribe(false);
    vi.advanceTimersByTime(10);
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits on width change', () => {
    subscribe(false);
    detectSizeChange(200, 100);

    // with throttling, this shouldn't fire just yet
    vi.advanceTimersByTime(20);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));
  });

  it('emits on height change', () => {
    subscribe(false);
    detectSizeChange(100, 200);

    // with throttling, this shouldn't fire just yet
    vi.advanceTimersByTime(20);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 200 }));
  });

  it('can handle multiple subscriptions on same element', () => {
    subscribe(true);

    const spy2: Mock<(dim: ElementDimensions) => void> = vi.fn();
    const subs2 = service
      .observe(component.theDiv().nativeElement, 50, true)
      .subscribe(dim => spy2(dim));

    vi.advanceTimersByTime(10);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));
    expect(spy2).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));

    detectSizeChange(200, 100);

    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));
    expect(spy2).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));

    subs2.unsubscribe();
  });
});
