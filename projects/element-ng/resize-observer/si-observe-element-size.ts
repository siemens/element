/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { effect, ElementRef, inject, isSignal, PLATFORM_ID, signal, Signal } from '@angular/core';

/** Options for the resize signal. */
export interface ObserveElementSizeOptions {
  /** Sets which box model the observer uses. */
  box?: ResizeObserverBoxOptions;
}

type SourceElement = Element | ElementRef<Element>;
type Source = SourceElement | Signal<SourceElement | undefined | null>;

/**
 * Creates a read-only signal backed by a `ResizeObserver` that tracks the size
 * of the given element. The signal holds the latest `ResizeObserverEntry` of
 * that element and is `undefined` until the observer reported the first time.
 *
 * Never fall back to a synchronously read layout value like `clientWidth` while
 * the signal is `undefined`. Consumers run before the browser performed layout,
 * so such a fallback reports stale or zero sizes. Skip the computation instead
 * and let it re-run once the first entry arrives.
 *
 * Use `computed()` to derive specific dimensions from the entry:
 *
 * @example
 * ```ts
 * private readonly resizeEntry = observeElementSize(this.elementRef);
 * readonly width = computed(() => this.resizeEntry()?.contentBoxSize[0].inlineSize);
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
 * The observer is automatically disconnected when the enclosing
 * `DestroyRef` is destroyed.
 *
 * @param source - An `Element`, `ElementRef`, or a signal resolving to one.
 * @param opt - Optional configuration for the underlying `ResizeObserver`.
 * @returns A read-only signal emitting the latest `ResizeObserverEntry`.
 * @remarks Must be called within an injection context (e.g. constructor,
 * field initializer, or `runInInjectionContext`).
 */
export const observeElementSize = (
  source: Source,
  opt?: ObserveElementSizeOptions
): Signal<ResizeObserverEntry | undefined> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || typeof ResizeObserver === 'undefined') {
    return signal<ResizeObserverEntry | undefined>(undefined).asReadonly();
  }

  const options = { box: opt?.box ?? 'content-box' };
  const entrySignal = signal<ResizeObserverEntry | undefined>(undefined);
  const observer = new ResizeObserver(entries => entrySignal.set(entries.at(-1)));
  effect(cleanup => {
    const next = isSignal(source) ? source() : source;
    // Prevent that previous entries leak into the new source.
    entrySignal.set(undefined);
    if (!next) {
      return;
    }
    const element = getElement(next);
    observer.observe(element, options);
    cleanup(() => observer.unobserve(element));
  });

  return entrySignal.asReadonly();
};

const getElement = (source: SourceElement): Element =>
  source instanceof Element ? source : source.nativeElement;
