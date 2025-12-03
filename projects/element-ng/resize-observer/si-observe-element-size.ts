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
export interface ResizeSignalOptions<ReturnType = ResizeObserverEntry[]> {
  /** Sets which box model the observer uses. */
  box?: ResizeObserverBoxOptions;
  /** Custom to mapping function to transform value to the desired type. */
  mapFn?: (entries: ResizeObserverEntry[]) => ReturnType;
}

type SourceElement = Element | ElementRef;
type Source = SourceElement | Signal<SourceElement | undefined | null>;

/**
 * Creates a signal that emits resize events for the given element.
 *
 * @param source - The HTML element to observe for resize events.
 * @param opt - Optional options to observe an element.
 * @returns A signal emitting resize events.
 */
export const observeElementSize = <ReturnType = ResizeObserverEntry[]>(
  source: Source,
  opt?: ResizeSignalOptions<ReturnType>
): Signal<ReturnType> => {
  const mapFn =
    opt?.mapFn ?? ((entries: ResizeObserverEntry[]) => entries as unknown as ReturnType);
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || typeof ResizeObserver === 'undefined') {
    return signal(mapFn([]));
  }

  const [get, set] = createSignal<ReturnType>(mapFn([]));
  const observer = new ResizeObserver(entries => set(mapFn(entries)));
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  if (isSignal(source)) {
    let currentEl: undefined | Element | ElementRef;
    effect(() => {
      const nextEl = source();
      if (nextEl && nextEl !== currentEl) {
        currentEl = nextEl;
        // Initial emit every time the element changes
        set(mapFn([]));
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

const observeElement = <ReturnType = ResizeObserverEntry[]>(
  observer: ResizeObserver,
  element: Element,
  opt?: ResizeSignalOptions<ReturnType>
): void => {
  const box = opt?.box ?? 'content-box';
  observer.disconnect();
  observer.observe(element, { box });
};
