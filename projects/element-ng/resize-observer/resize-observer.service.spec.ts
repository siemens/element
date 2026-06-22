/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { Mock } from 'vitest';
import { page } from 'vitest/browser';

import { ElementDimensions, ResizeObserverService } from './resize-observer.service';

@Component({
  template: `<div #theDiv class="w-100 vh-100">Testli</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
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

  beforeEach(async () => {
    await page.viewport(100, 100);
    service = TestBed.inject(ResizeObserverService);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    spy = vi.fn();

    vi.useFakeTimers();
  });

  afterEach(() => {
    subscription?.unsubscribe();
    vi.useRealTimers();
  });

  it('emits initial size event when asked', async () => {
    subscribe(true);
    vi.advanceTimersByTime(10);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));
  });

  it('emits no initial size event when not asked', async () => {
    subscribe(false);
    vi.advanceTimersByTime(10);
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits on width change', async () => {
    subscribe(false);
    await page.viewport(200, 100);

    // with throttling, this shouldn't fire just yet
    vi.advanceTimersByTime(20);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));
  });

  it('emits on height change', async () => {
    subscribe(false);
    await page.viewport(100, 200);

    // with throttling, this shouldn't fire just yet
    vi.advanceTimersByTime(20);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 200 }));
  });

  it('can handle multiple subscriptions on same element', async () => {
    subscribe(true);

    const spy2: Mock<(dim: ElementDimensions) => void> = vi.fn();
    const subs2 = service
      .observe(component.theDiv().nativeElement, 50, true)
      .subscribe(dim => spy2(dim));

    vi.advanceTimersByTime(20);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));
    expect(spy2).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));

    await page.viewport(200, 100);

    vi.advanceTimersByTime(150);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));
    expect(spy2).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));

    subs2.unsubscribe();
  });
});
