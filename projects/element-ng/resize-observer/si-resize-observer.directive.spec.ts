/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resetViewport } from '@siemens/element-ng/test-helpers';
import { MockInstance } from 'vitest';
import { page } from 'vitest/browser';

import { ElementDimensions } from './index';
import { SiResizeObserverDirective } from './si-resize-observer.directive';

@Component({
  imports: [SiResizeObserverDirective],
  template: `
    <div
      #theDiv
      class="vh-100 w-100"
      [emitInitial]="emitInitial()"
      (siResizeObserver)="resizeHandler($event)"
    >
      Testli
    </div>
  `
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
  readonly emitInitial = signal(true);

  resizeHandler(dim: ElementDimensions): void {}
}

describe('SiResizeObserverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: MockInstance;

  beforeEach(async () => {
    await page.viewport(100, 100);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = vi.spyOn(component, 'resizeHandler');
    vi.useFakeTimers();
    await fixture.whenStable();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await resetViewport();
  });

  it('emits initial size event', () => {
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 100 });
  });

  it('emits on width change', async () => {
    await page.viewport(200, 100);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('emits on height change', async () => {
    await page.viewport(100, 200);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledWith({ width: 100, height: 200 });
  });
});

describe('SiResizeObserverDirective with emitInitial=false', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: MockInstance;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.emitInitial.set(false);
    spy = vi.spyOn(component, 'resizeHandler');
    vi.useFakeTimers();
    await fixture.whenStable();
  });

  afterEach(() => vi.useRealTimers());

  it('does not emit initial size event', () => {
    vi.advanceTimersByTime(0);
    expect(spy).not.toHaveBeenCalled();
  });
});
