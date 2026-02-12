/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
  let spy: jasmine.Spy<(dim: ElementDimensions) => void>;

  const detectSizeChange = (inlineSize: number = 100, blockSize: number = 100): void => {
    component.width.set(inlineSize);
    component.height.set(blockSize);
    fixture.detectChanges();
    MockResizeObserver.triggerResize({});
    fixture.detectChanges();
  };

  beforeEach(() => {
    mockResizeObserver();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = spyOn(component, 'resizeHandler');
  });

  beforeEach(() => jasmine.clock().install());

  afterEach(() => {
    restoreResizeObserver();
    jasmine.clock().uninstall();
  });

  it('emits initial size event', async () => {
    fixture.detectChanges();
    jasmine.clock().tick(100);
    await fixture.whenStable();
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 100 });
  });

  it('emits on width change', async () => {
    // not interested in the initial event
    spy.calls.reset();
    detectSizeChange(200, 100);

    expect(component.resizeHandler).not.toHaveBeenCalled();

    jasmine.clock().tick(100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('emits on height change', async () => {
    // not interested in the initial event
    spy.calls.reset();

    detectSizeChange(100, 200);

    expect(component.resizeHandler).not.toHaveBeenCalled();

    jasmine.clock().tick(100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 200 });
  });
});

describe('SiResizeObserverDirective with emitInitial=false', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: jasmine.Spy<(dim: ElementDimensions) => void>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.emitInitial = false;
    spy = spyOn(component, 'resizeHandler');
    fixture.detectChanges();
  });

  it('does not emit initial size event', () => {
    expect(spy).not.toHaveBeenCalled();
  });
});
