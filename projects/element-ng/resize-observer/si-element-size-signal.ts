/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { effect, ElementRef, inject, isSignal, PLATFORM_ID, signal, Signal } from '@angular/core';

import { ResizeObserverRegistry } from './resize-observer.registry';

/**
 * The logical dimensions of an observed element.
 *
 * @experimental
 */
export interface ElementSize {
  readonly inlineSize: number;
  readonly blockSize: number;
}

/** Options for the resize signal. */
export interface ElementSizeSignalOptions {
  /** Sets which box model the observer uses. */
  box?: ResizeObserverBoxOptions;
}

type SourceElement = Element | ElementRef<Element>;

/**
 * An element or signal resolving to an element observed by {@link elementSizeSignal}.
 *
 * @experimental
 */
export type ElementSizeSignalSource = SourceElement | Signal<SourceElement | undefined | null>;

/**
 * Creates a read-only signal backed by a shared `ResizeObserver` that tracks the
 * configured box size of the given element. The signal is `undefined` until the
 * observer reported the first time.
 *
 * Never fall back to a synchronously read layout value like `clientWidth` while
 * the signal is `undefined`. Consumers run before the browser performed layout,
 * so such a fallback reports stale or zero sizes. Skip the computation instead
 * and let it re-run once the first size arrives.
 *
 * Use `computed()` to derive specific dimensions from the size signal:
 *
 * @example
 * ```ts
 * private readonly size = elementSizeSignal(this.elementRef);
 * readonly width = computed(() => this.size()?.inlineSize);
 * ```
 *
 * The source can be a static element or a signal that resolves to one.
 * When a signal source emits a new element, the observer automatically
 * stops observing the previous element and re-attaches to the new one,
 * resetting the signal to `undefined`.
 *
 * On the server or when `ResizeObserver` is unavailable, the returned
 * signal permanently holds `undefined`.
 *
 * The observation is automatically removed when the enclosing `DestroyRef`
 * is destroyed.
 *
 * @experimental
 * @param source - An `Element`, `ElementRef`, or a signal resolving to one.
 * @param options - Optional configuration for the underlying `ResizeObserver`.
 * @returns A read-only signal emitting the latest size of the configured box.
 * @remarks Must be called within an injection context (e.g. constructor,
 * field initializer, or `runInInjectionContext`).
 */
export const elementSizeSignal = (
  source: ElementSizeSignalSource,
  options?: ElementSizeSignalOptions
): Signal<ElementSize | undefined> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || typeof ResizeObserver === 'undefined') {
    return signal<ElementSize | undefined>(undefined).asReadonly();
  }

  const box = options?.box ?? 'content-box';
  const resizeObserver = inject(ResizeObserverRegistry);
  const sizeSignal = signal<ElementSize | undefined>(undefined, { equal: equalElementSize });
  effect(cleanup => {
    const next = isSignal(source) ? source() : source;
    // Prevent that the previous element's size leaks into the new source.
    sizeSignal.set(undefined);
    if (!next) {
      return;
    }
    const element = getElement(next);
    cleanup(resizeObserver.observe(element, box, entry => sizeSignal.set(getBoxSize(entry, box))));
  });

  return sizeSignal.asReadonly();
};

const equalElementSize = (
  previous: ElementSize | undefined,
  current: ElementSize | undefined
): boolean =>
  previous === current ||
  (!!previous &&
    !!current &&
    previous.inlineSize === current.inlineSize &&
    previous.blockSize === current.blockSize);

const getBoxSize = (
  entry: ResizeObserverEntry,
  box: ResizeObserverBoxOptions
): ElementSize | undefined => {
  let size: ResizeObserverSize | undefined;
  switch (box) {
    case 'border-box':
      size = entry.borderBoxSize.at(0);
      break;
    case 'device-pixel-content-box':
      size = entry.devicePixelContentBoxSize.at(0);
      break;
    default:
      size = entry.contentBoxSize.at(0);
  }
  return size && { inlineSize: size.inlineSize, blockSize: size.blockSize };
};

const getElement = (source: SourceElement): Element =>
  source instanceof Element ? source : source.nativeElement;
