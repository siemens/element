/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';

import { ElementDimensions, ResizeObserverService } from './index';
import { SiResizeObserverDirective } from './si-resize-observer.directive';

@Component({
  imports: [SiResizeObserverDirective],
  template: `
    <div
      style="width: 100px; height: 100px;"
      [style.width.px]="width"
      [style.height.px]="height"
      [emitInitial]="emitInitial"
      (siResizeObserver)="resizeHandler($event)"
    >
      Testli
    </div>
  `
})
class TestHostComponent {
  width = 100;
  height = 100;
  emitInitial = true;

  resizeHandler(dim: ElementDimensions): void {}
}

describe('SiResizeObserverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let spy: jasmine.Spy<(dim: ElementDimensions) => void>;

  const detectSizeChange = (): void => {
    fixture.detectChanges();
    tick();
    TestBed.inject(ResizeObserverService)._checkAll();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: []
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    spy = spyOn(component, 'resizeHandler');
    fixture.detectChanges();
    tick();
  }));

  it('emits initial size event', fakeAsync(() => {
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 100, height: 100 });
  }));

  it('emits on width change', fakeAsync(() => {
    // not interested in the initial event
    spy.calls.reset();

    component.width = 200;
    detectSizeChange();

    // with throttling, this shouldn't fire just yet
    tick(10);
    expect(component.resizeHandler).not.toHaveBeenCalled();

    flush();
    expect(component.resizeHandler).toHaveBeenCalledWith({ width: 200, height: 100 });
  }));

  it('emits on height change', fakeAsync(() => {
    // not interested in the initial event
    spy.calls.reset();

    component.height = 200;
    detectSizeChange();

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
