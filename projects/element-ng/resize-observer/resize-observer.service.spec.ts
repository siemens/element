/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from './mock-resize-observer.spec';
import { ElementDimensions, ResizeObserverService } from './resize-observer.service';

@Component({
  template: `<div #theDiv [style.width.px]="width()" [style.height.px]="height()">Testli</div>`
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
  readonly width = signal(100);
  readonly height = signal(100);
}

// A timeout that works with `await`. We have to use `waitForAsync()``
// in the tests below because `tick()` doesn't work because `ResizeObserver`
// operates outside of the zone
const timeout = async (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

describe('ResizeObserverService', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let service: ResizeObserverService;
  let subscription: Subscription;
  let spy: jasmine.Spy<(dim: ElementDimensions) => void>;

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

  beforeEach(fakeAsync(() => {
    mockResizeObserver();
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
    service = TestBed.inject(ResizeObserverService);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    spy = jasmine.createSpy();
  }));

  afterEach(() => {
    subscription?.unsubscribe();
    restoreResizeObserver();
  });

  it('emits initial size event when asked', waitForAsync(async () => {
    subscribe(true);
    await timeout(10);
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ width: 100, height: 100 }));
  }));

  it('emits no initial size event when not asked', waitForAsync(async () => {
    subscribe(false);
    await timeout(10);
    expect(spy).not.toHaveBeenCalled();
  }));

  it('emits on width change', waitForAsync(async () => {
    subscribe(false);
    detectSizeChange(200, 100);

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      // with throttling, this shouldn't fire just yet
      await timeout(20);
      expect(spy).not.toHaveBeenCalled();

      await timeout(150);
      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ width: 200, height: 100 }));
    }
  }));

  it('emits on height change', waitForAsync(async () => {
    subscribe(false);
    detectSizeChange(100, 200);

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      // with throttling, this shouldn't fire just yet
      await timeout(20);
      expect(spy).not.toHaveBeenCalled();

      await timeout(150);
      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ width: 100, height: 200 }));
    }
  }));

  it('can handle multiple subscriptions on same element', waitForAsync(async () => {
    subscribe(true);

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      const spy2: jasmine.Spy<(dim: ElementDimensions) => void> = jasmine.createSpy();
      const subs2 = service
        .observe(component.theDiv().nativeElement, 50, true)
        .subscribe(dim => spy2(dim));

      await timeout(20);
      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ width: 100, height: 100 }));
      expect(spy2).toHaveBeenCalledWith(jasmine.objectContaining({ width: 100, height: 100 }));

      detectSizeChange(200, 100);

      await timeout(150);
      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ width: 200, height: 100 }));
      expect(spy2).toHaveBeenCalledWith(jasmine.objectContaining({ width: 200, height: 100 }));

      subs2.unsubscribe();
    }
  }));
});
