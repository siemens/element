/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ElementRef,
  inject,
  PLATFORM_ID,
  Signal,
  signal,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { finalize, Subject } from 'rxjs';
import { expectTypeOf } from 'vitest';

import { observeSize } from './observe-size';
import { ElementDimensions, ResizeObserverService } from './resize-observer.service';

@Component({
  template: `
    @if (showPanel()) {
      <div #panel></div>
    }
  `
})
class TestComponent {
  readonly showPanel = signal(true);
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  readonly hostSize = observeSize(inject(ElementRef<HTMLElement>));
  readonly panelSize = observeSize(this.panel);
}

@Component({
  template: `<div #panel style="width: 120px; height: 60px"></div>`
})
class RequiredQueryComponent {
  readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  readonly size = observeSize(this.panel);
}

describe('observeSize', () => {
  const streams = new Map<Element, Subject<ElementDimensions>>();
  const unsubscribe = vi.fn();
  const observe = vi.fn((element: Element) => {
    let stream = streams.get(element);
    if (!stream) {
      stream = new Subject<ElementDimensions>();
      streams.set(element, stream);
    }
    return stream.pipe(finalize(() => unsubscribe(element)));
  });
  let fixture: ComponentFixture<TestComponent>;

  const createElement = (width = 120, height = 60): HTMLElement => {
    const element = document.createElement('div');
    Object.defineProperties(element, {
      clientWidth: { value: width },
      clientHeight: { value: height }
    });
    return element;
  };

  beforeEach(() => {
    streams.clear();
    observe.mockClear();
    unsubscribe.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: ResizeObserverService, useValue: { observe } }]
    });
  });

  const createFixture = (): void => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  };

  it('observes an explicitly supplied host reference with initial emissions always enabled', async () => {
    createFixture();
    await fixture.whenStable();

    expectTypeOf(fixture.componentInstance.hostSize).toEqualTypeOf<Signal<ElementDimensions>>();
    expect(observe).toHaveBeenCalledWith(fixture.nativeElement, 100, true, false);
    streams.get(fixture.nativeElement)!.next({ width: 300, height: 200 });

    expect(fixture.componentInstance.hostSize()).toEqual({ width: 300, height: 200 });
  });

  it('provides synchronous dimensions for a definite element', async () => {
    createFixture();
    const element = createElement();
    const size = observeSize(element, { injector: fixture.debugElement.injector });

    expectTypeOf(size).toEqualTypeOf<Signal<ElementDimensions>>();
    expect(size()).toEqual({ width: 120, height: 60 });
    await fixture.whenStable();
    expect(observe).toHaveBeenCalledWith(element, 100, true, false);
  });

  it('accepts element references and forwards the resize options', async () => {
    createFixture();
    const element = createElement();
    const size = observeSize(new ElementRef(element), {
      injector: fixture.debugElement.injector,
      throttle: 25,
      emitImmediate: true
    });
    await fixture.whenStable();

    expect(size()).toEqual({ width: 120, height: 60 });
    expect(observe).toHaveBeenCalledWith(element, 25, true, true);
  });

  it('supports required view queries without resolving them during construction', async () => {
    const requiredFixture = TestBed.createComponent(RequiredQueryComponent);
    requiredFixture.detectChanges();
    await requiredFixture.whenStable();
    const component = requiredFixture.componentInstance;

    expectTypeOf(component.size).toEqualTypeOf<Signal<ElementDimensions>>();
    expect(component.size()).toEqual({ width: 120, height: 60 });
    expect(observe).toHaveBeenCalledWith(component.panel().nativeElement, 100, true, false);
  });

  it('clears the size when an optional view query disappears', async () => {
    createFixture();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const element = component.panel()!.nativeElement;
    streams.get(element)!.next({ width: 120, height: 60 });
    expect(component.panelSize()).toEqual({ width: 120, height: 60 });

    component.showPanel.set(false);
    await fixture.whenStable();

    expect(component.panelSize()).toBeUndefined();
    expect(unsubscribe).toHaveBeenCalledWith(element);
  });

  it('updates the signal when the real resize observer detects a size change', async () => {
    TestBed.overrideProvider(ResizeObserverService, {
      useFactory: () => new ResizeObserverService()
    });
    const requiredFixture = TestBed.createComponent(RequiredQueryComponent);
    requiredFixture.detectChanges();
    await requiredFixture.whenStable();
    const component = requiredFixture.componentInstance;
    expect(component.size()).toEqual({ width: 120, height: 60 });

    component.panel().nativeElement.style.width = '240px';

    await vi.waitFor(() => expect(component.size()).toEqual({ width: 240, height: 60 }));
  });

  it('returns undefined without observing when the target is absent', async () => {
    createFixture();
    await fixture.whenStable();
    observe.mockClear();
    const size = observeSize(undefined, { injector: fixture.debugElement.injector });
    await fixture.whenStable();

    expectTypeOf(size).toEqualTypeOf<Signal<ElementDimensions | undefined>>();
    expect(size()).toBeUndefined();
    expect(observe).not.toHaveBeenCalled();
  });

  it('switches reactive targets and ignores emissions from the previous target', async () => {
    createFixture();
    const first = createElement();
    const second = createElement(240, 180);
    const target = signal(first);
    const size = observeSize(target, { injector: fixture.debugElement.injector });
    expectTypeOf(size).toEqualTypeOf<Signal<ElementDimensions>>();
    await fixture.whenStable();
    streams.get(first)!.next({ width: 150, height: 80 });
    expect(size()).toEqual({ width: 150, height: 80 });

    target.set(second);
    streams.get(first)!.next({ width: 999, height: 999 });
    expect(size()).toEqual({ width: 240, height: 180 });
    await fixture.whenStable();

    expect(unsubscribe).toHaveBeenCalledWith(first);
    expect(observe).toHaveBeenCalledWith(second, 100, true, false);
    streams.get(second)!.next({ width: 250, height: 190 });
    expect(size()).toEqual({ width: 250, height: 190 });
  });

  it('starts and stops observing an optional reactive target', async () => {
    createFixture();
    const element = createElement();
    const target = signal<HTMLElement | undefined>(undefined);
    const size = observeSize(() => target(), { injector: fixture.debugElement.injector });
    expectTypeOf(size).toEqualTypeOf<Signal<ElementDimensions | undefined>>();
    expect(size()).toBeUndefined();
    await fixture.whenStable();

    target.set(element);
    expect(size()).toEqual({ width: 120, height: 60 });
    await fixture.whenStable();
    expect(observe).toHaveBeenCalledWith(element, 100, true, false);

    target.set(undefined);
    expect(size()).toBeUndefined();
    await fixture.whenStable();
    expect(unsubscribe).toHaveBeenCalledWith(element);
  });

  it('unsubscribes when the owning component is destroyed', async () => {
    createFixture();
    const element = createElement();
    const size = observeSize(element, { injector: fixture.debugElement.injector });
    await fixture.whenStable();

    fixture.destroy();
    streams.get(element)!.next({ width: 999, height: 999 });

    expect(unsubscribe).toHaveBeenCalledWith(element);
    expect(size()).toEqual({ width: 120, height: 60 });
  });

  it('returns zero dimensions on the server without measuring or subscribing', async () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    createFixture();
    const element = document.createElement('div');
    const measureWidth = vi.spyOn(element, 'clientWidth', 'get');
    const measureHeight = vi.spyOn(element, 'clientHeight', 'get');
    const size = observeSize(element, { injector: fixture.debugElement.injector });
    await fixture.whenStable();

    expect(size()).toEqual({ width: 0, height: 0 });
    expect(fixture.componentInstance.hostSize()).toEqual({ width: 0, height: 0 });
    expect(observe).not.toHaveBeenCalled();
    expect(measureWidth).not.toHaveBeenCalled();
    expect(measureHeight).not.toHaveBeenCalled();
  });

  it('requires an injection context when no injector is provided', () => {
    expect(() => observeSize(createElement())).toThrow(/injection context/);
  });
});
