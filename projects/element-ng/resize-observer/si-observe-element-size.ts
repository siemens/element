/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  effect,
  ElementRef,
  inject,
  isSignal,
  PLATFORM_ID,
  signal,
  Signal
} from '@angular/core';
import { createSignal } from '@angular/core/primitives/signals';

/** Options for the resize signal. */
export interface ResizeSignalOptions {
  /** Sets which box model the observer uses. */
  box?: ResizeObserverBoxOptions;
}

type SourceElement = Element | ElementRef;
type Source = SourceElement | Signal<SourceElement>;

/**
 * Creates a signal that emits resize events for the given element.
 *
 * @param source - The HTML element to observe for resize events.
 * @param opt - Optional options to observe an element.
 * @returns A signal emitting resize events.
 */
export const observeElementSize = (
  source: Source,
  opt?: ResizeSignalOptions
): Signal<ResizeObserverEntry[]> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || typeof ResizeObserver === 'undefined') {
    return signal([]);
  }

  const [get, set] = createSignal<ResizeObserverEntry[]>([]);
  const observer = new ResizeObserver(set);
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  if (isSignal(source)) {
    let currentEl: undefined | Element | ElementRef;
    effect(() => {
      const nextEl = source();
      if (nextEl !== currentEl) {
        currentEl = nextEl;
        observeElement(observer, getElement(currentEl), opt);
      }
    });
  } else {
    observeElement(observer, getElement(source), opt);
  }

  return get;
};

const getElement = (source: SourceElement): Element =>
  source instanceof Element ? source : source.nativeElement;

const observeElement = (
  observer: ResizeObserver,
  element: Element,
  opt?: ResizeSignalOptions
): void => {
  const box = opt?.box ?? 'content-box';
  observer.disconnect();
  observer.observe(element, { box });
};
