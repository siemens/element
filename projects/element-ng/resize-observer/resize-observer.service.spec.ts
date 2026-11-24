/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
  readonly theDiv = viewChild.required<ElementRef<HTMLElement>>('theDiv');
  readonly width = signal(100);
  readonly height = signal(100);
}

describe('ResizeObserverService', () => {
  let component: TestHostComponent;
  let service: ResizeObserverService;
  let subscriptions: Subscription;
  let spy: Mock<(dim: ElementDimensions) => void>;

  const subscribe = (initial: boolean): void => {
    subscriptions.add(
      service.observe(component.theDiv().nativeElement, 50, initial).subscribe(dim => spy(dim))
    );
  };

  const resize = (width: number, height: number): void => {
    component.width.set(width);
    component.height.set(height);
    TestBed.tick();
    MockResizeObserver.triggerResize({});
  };

  beforeEach(async () => {
    mockResizeObserver();
    subscriptions = new Subscription();
    service = TestBed.inject(ResizeObserverService);
    const fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    spy = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    subscriptions.unsubscribe();
    restoreResizeObserver();
    vi.useRealTimers();
  });

  it('emits initial size event when asked', () => {
    subscribe(true);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 100 });
  });

  it('emits no initial size event when not asked', () => {
    subscribe(false);
    vi.advanceTimersByTime(49);
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits on width change', () => {
    subscribe(false);
    resize(200, 100);
    vi.advanceTimersByTime(49);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('emits on height change', () => {
    subscribe(false);
    resize(100, 200);
    vi.advanceTimersByTime(49);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 200 });
  });

  it('can handle multiple subscriptions on same element', () => {
    subscribe(true);

    const spy2: Mock<(dim: ElementDimensions) => void> = vi.fn();
    subscriptions.add(
      service.observe(component.theDiv().nativeElement, 50, true).subscribe(dim => spy2(dim))
    );

    vi.advanceTimersByTime(0);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 100 });
    expect(spy2).toHaveBeenCalledWith({ width: 100, height: 100 });
    resize(200, 100);
    vi.advanceTimersByTime(50);
    expect(spy).toHaveBeenCalledWith({ width: 200, height: 100 });
    expect(spy2).toHaveBeenCalledWith({ width: 200, height: 100 });
  });
});
