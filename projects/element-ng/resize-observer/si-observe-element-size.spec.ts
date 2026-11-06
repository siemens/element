/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, inject, signal, Signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { observeElementSize } from './si-observe-element-size';

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

  readonly elementEntry = observeElementSize(this.hostElement.nativeElement);
  readonly elementRefEntry = observeElementSize(this.hostElement);
  readonly elementSignalEntry = observeElementSize(this.elementSignal);
  readonly elementRefSignalEntry = observeElementSize(this.elementRefSignal);

  readonly source = signal<Element | ElementRef<Element> | null | undefined>(undefined);
  readonly sourceEntry = observeElementSize(this.source);
  readonly fixedElement = viewChild.required<ElementRef<HTMLDivElement>>('fixedElement');

  readonly borderElement = viewChild<ElementRef<HTMLDivElement>>('borderElement');
  readonly borderEntry = observeElementSize(this.borderElement, { box: 'border-box' });
}

type EntrySelector = (component: TestHostComponent) => Signal<ResizeObserverEntry | undefined>;

describe('observeElementSize', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  // ResizeObserver notifications are delivered after rAF callbacks during a rendering frame.
  const waitForResizeObserver = (): Promise<void> =>
    new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

  const expectEntrySize = (
    entry: ResizeObserverEntry | undefined,
    target: Element,
    inlineSize: number,
    blockSize: number,
    box: 'contentBoxSize' | 'borderBoxSize' = 'contentBoxSize'
  ): void => {
    expect(entry).toBeDefined();
    expect(entry!.target).toBe(target);
    expect(entry![box][0].inlineSize).toBeCloseTo(inlineSize);
    expect(entry![box][0].blockSize).toBeCloseTo(blockSize);
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
  ] satisfies [name: string, selectEntry: EntrySelector][])(
    'observes native viewport resizes from an %s source',
    async ([, selectEntry]) => {
      const entry = selectEntry(component);
      const element = component.hostElement.nativeElement;

      expect(entry()).toBeUndefined();

      await waitForResizeObserver();
      expectEntrySize(entry(), element, INITIAL_WIDTH, INITIAL_HEIGHT);
      const initialEntry = entry();

      await page.viewport(RESIZED_WIDTH, RESIZED_HEIGHT);
      await waitForResizeObserver();

      expect(entry()).not.toBe(initialEntry);
      expectEntrySize(entry(), element, RESIZED_WIDTH, RESIZED_HEIGHT);
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
    expectEntrySize(component.sourceEntry(), viewportElement, INITIAL_WIDTH, INITIAL_HEIGHT);

    component.source.set(fixedElement);
    TestBed.tick();
    expect(component.sourceEntry()).toBeUndefined();
    await waitForResizeObserver();
    expectEntrySize(component.sourceEntry(), fixedElement.nativeElement, 120, 80);
    const fixedSizeEntry = component.sourceEntry();

    await page.viewport(RESIZED_WIDTH, RESIZED_HEIGHT);
    await waitForResizeObserver();
    expect(component.sourceEntry()).toBe(fixedSizeEntry);

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
    expectEntrySize(component.borderEntry(), element, 100, 80, 'borderBoxSize');
    const initialEntry = component.borderEntry();

    element.style.borderWidth = '10px';
    await waitForResizeObserver();

    expect(component.borderEntry()).not.toBe(initialEntry);
    expectEntrySize(component.borderEntry(), element, 120, 100, 'borderBoxSize');
    expect(component.borderEntry()!.contentBoxSize[0]).toMatchObject({
      inlineSize: 100,
      blockSize: 80
    });
  });

  it('stops observing when the test host is destroyed', async () => {
    const entry = component.elementEntry;
    const element = component.hostElement.nativeElement;
    await waitForResizeObserver();
    expectEntrySize(entry(), element, INITIAL_WIDTH, INITIAL_HEIGHT);
    const observedEntry = entry();

    fixture.destroy();
    await page.viewport(RESIZED_WIDTH, RESIZED_HEIGHT);
    await waitForResizeObserver();

    expect(element.getBoundingClientRect()).toMatchObject({
      width: RESIZED_WIDTH,
      height: RESIZED_HEIGHT
    });
    expect(entry()).toBe(observedEntry);
  });
});
