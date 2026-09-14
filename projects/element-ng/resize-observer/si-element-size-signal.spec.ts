/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, inject, signal, Signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { ResizeObserverService } from './resize-observer.service';
import { ElementSize, elementSizeSignal } from './si-element-size-signal';
import {
  mockResizeObserver,
  MockResizeObserver,
  restoreResizeObserver
} from './testing/resize-observer.mock';

const INITIAL_WIDTH = 200;
const INITIAL_HEIGHT = 120;
const RESIZED_WIDTH = 320;
const RESIZED_HEIGHT = 180;

@Component({
  template: `
    <div #fixedElement class="fixed-element"></div>
    <div #borderElement class="border-element"></div>
  `,
  styles: `
    .fixed-element {
      width: 120px;
      height: 80px;
    }

    .border-element {
      box-sizing: content-box;
      width: 100px;
      height: 80px;
      border: 0 solid transparent;
    }
  `,
  host: {
    style: 'position: fixed; inset: 0; display: block;'
  }
})
class TestHostComponent {
  readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly elementSignal = signal<Element>(this.hostElement.nativeElement);
  private readonly elementRefSignal = signal<ElementRef<Element>>(this.hostElement);

  readonly elementEntry = elementSizeSignal(this.hostElement.nativeElement);
  readonly elementRefEntry = elementSizeSignal(this.hostElement);
  readonly elementSignalEntry = elementSizeSignal(this.elementSignal);
  readonly elementRefSignalEntry = elementSizeSignal(this.elementRefSignal);

  readonly source = signal<Element | ElementRef<Element> | null | undefined>(undefined);
  readonly sourceEntry = elementSizeSignal(this.source);
  readonly fixedElement = viewChild.required<ElementRef<HTMLDivElement>>('fixedElement');

  readonly borderElement = viewChild<ElementRef<HTMLDivElement>>('borderElement');
  readonly borderEntry = elementSizeSignal(this.borderElement, { box: 'border-box' });
}

type SizeSelector = (component: TestHostComponent) => Signal<ElementSize | undefined>;

describe('elementSizeSignal', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  // ResizeObserver notifications are delivered after rAF callbacks during a rendering frame.
  const waitForResizeObserver = (): Promise<void> =>
    new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

  const expectSize = (
    size: ElementSize | undefined,
    inlineSize: number,
    blockSize: number
  ): void => {
    expect(size?.inlineSize).toBeCloseTo(inlineSize);
    expect(size?.blockSize).toBeCloseTo(blockSize);
  };

  beforeEach(async () => {
    await page.viewport(INITIAL_WIDTH, INITIAL_HEIGHT);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.for([
    ['Element', host => host.elementEntry],
    ['ElementRef', host => host.elementRefEntry],
    ['Signal<Element>', host => host.elementSignalEntry],
    ['Signal<ElementRef>', host => host.elementRefSignalEntry]
  ] satisfies [name: string, selectSize: SizeSelector][])(
    'observes native viewport resizes from an %s source',
    async ([, selectEntry]) => {
      const size = selectEntry(component);

      expect(size()).toBeUndefined();

      await waitForResizeObserver();
      expectSize(size(), INITIAL_WIDTH, INITIAL_HEIGHT);
      const initialSize = size();

      await page.viewport(RESIZED_WIDTH, RESIZED_HEIGHT);
      await waitForResizeObserver();

      expect(size()).not.toBe(initialSize);
      expectSize(size(), RESIZED_WIDTH, RESIZED_HEIGHT);
    }
  );

  it('switches a signal source and stops observing its previous element', async () => {
    const viewportElement = component.hostElement.nativeElement;
    const fixedElement = component.fixedElement();

    expect(component.sourceEntry()).toBeUndefined();

    component.source.set(viewportElement);
    TestBed.tick();
    expect(component.sourceEntry()).toBeUndefined();
    await waitForResizeObserver();
    expectSize(component.sourceEntry(), INITIAL_WIDTH, INITIAL_HEIGHT);

    component.source.set(fixedElement);
    TestBed.tick();
    expect(component.sourceEntry()).toBeUndefined();
    await waitForResizeObserver();
    expectSize(component.sourceEntry(), 120, 80);
    const fixedSize = component.sourceEntry();

    await page.viewport(RESIZED_WIDTH, RESIZED_HEIGHT);
    await waitForResizeObserver();
    expect(component.sourceEntry()).toBe(fixedSize);

    component.source.set(null);
    TestBed.tick();
    expect(component.sourceEntry()).toBeUndefined();

    await page.viewport(INITIAL_WIDTH, INITIAL_HEIGHT);
    await waitForResizeObserver();
    expect(component.sourceEntry()).toBeUndefined();
  });

  it('observes the configured border box', async () => {
    const element = component.borderElement()!.nativeElement;
    await waitForResizeObserver();
    expectSize(component.borderEntry(), 100, 80);
    const initialSize = component.borderEntry();

    element.style.borderWidth = '10px';
    await waitForResizeObserver();

    expect(component.borderEntry()).not.toBe(initialSize);
    expectSize(component.borderEntry(), 120, 100);
  });

  it('stops observing when the test host is destroyed', async () => {
    const size = component.elementEntry;
    const element = component.hostElement.nativeElement;
    await waitForResizeObserver();
    expectSize(size(), INITIAL_WIDTH, INITIAL_HEIGHT);
    const observedSize = size();

    fixture.destroy();
    await page.viewport(RESIZED_WIDTH, RESIZED_HEIGHT);
    await waitForResizeObserver();

    expect(element.getBoundingClientRect()).toMatchObject({
      width: RESIZED_WIDTH,
      height: RESIZED_HEIGHT
    });
    expect(size()).toBe(observedSize);
  });
});

describe('elementSizeSignal with a mocked ResizeObserver', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => mockResizeObserver());

  afterEach(() => {
    fixture?.destroy();
    restoreResizeObserver();
  });

  it('shares one native observer across signal and service calls', async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const serviceElement = document.createElement('div');
    const subscription = TestBed.inject(ResizeObserverService)
      .observe(serviceElement, 0)
      .subscribe();

    expect(MockResizeObserver.instances).toHaveLength(1);
    expect(MockResizeObserver.instances[0].observed).toHaveLength(3);
    expect(MockResizeObserver.instances[0].observed).toContainEqual([
      fixture.componentInstance.hostElement.nativeElement,
      { box: 'content-box' }
    ]);
    expect(MockResizeObserver.instances[0].observed).toContainEqual([
      fixture.componentInstance.borderElement()!.nativeElement,
      { box: 'border-box' }
    ]);
    expect(MockResizeObserver.instances[0].observed).toContainEqual([
      serviceElement,
      { box: 'content-box' }
    ]);
    expect(MockResizeObserver.instances[0].unobserve).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('returns undefined when the configured box has no fragments', async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const target = component.hostElement.nativeElement;

    MockResizeObserver.triggerResize({ target, inlineSize: 120, blockSize: 80 });
    expect(component.elementEntry()).toEqual({ inlineSize: 120, blockSize: 80 });

    MockResizeObserver.triggerResize({ target, contentBoxSize: [] });
    expect(component.elementEntry()).toBeUndefined();
  });

  it('preserves the size when dimensions are unchanged', async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const target = component.hostElement.nativeElement;

    MockResizeObserver.triggerResize({ target, inlineSize: 120, blockSize: 80 });
    const initialSize = component.elementEntry();

    MockResizeObserver.triggerResize({ target, inlineSize: 120, blockSize: 80 });
    expect(component.elementEntry()).toBe(initialSize);
  });
});
