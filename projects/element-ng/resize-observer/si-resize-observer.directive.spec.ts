/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, viewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';

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
      style="width: 100px; height: 100px;"
      [emitInitial]="emitInitial"
      (siResizeObserver)="resizeHandler($event)"
    >
      Testli
    </div>
  `
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
  emitInitial = true;

  resizeHandler(dim: ElementDimensions): void {}
}

describe('SiResizeObserverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: jasmine.Spy<(dim: ElementDimensions) => void>;

  const detectSizeChange = (inlineSize: number = 100, blockSize: number = 100): void => {
    MockResizeObserver.triggerResize({
      target: component.theDiv().nativeElement,
      inlineSize,
      blockSize
    });
    fixture.detectChanges();
    tick();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: []
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    mockResizeObserver();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = spyOn(component, 'resizeHandler');
    fixture.detectChanges();
    tick();
  }));

  afterEach(() => {
    restoreResizeObserver();
  });

  it('emits initial size event', fakeAsync(() => {
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 100 });
  }));

  it('emits on width change', fakeAsync(() => {
    // not interested in the initial event
    spy.calls.reset();
    detectSizeChange(200, 100);

    // with throttling, this shouldn't fire just yet
    tick(10);
    expect(component.resizeHandler).not.toHaveBeenCalled();

    flush();
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 200, height: 100 });
  }));

  it('emits on height change', fakeAsync(() => {
    // not interested in the initial event
    spy.calls.reset();

    detectSizeChange(100, 200);

    // with throttling, this shouldn't fire just yet
    tick(10);
    expect(component.resizeHandler).not.toHaveBeenCalled();

    flush();
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 200 });
  }));
});

describe('SiResizeObserverDirective with emitInitial=false', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: jasmine.Spy<(dim: ElementDimensions) => void>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: []
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.emitInitial = false;
    spy = spyOn(component, 'resizeHandler');
    fixture.detectChanges();
    tick();
  }));

  it('does not emit initial size event', fakeAsync(() => {
    expect(spy).not.toHaveBeenCalled();
  }));
});
