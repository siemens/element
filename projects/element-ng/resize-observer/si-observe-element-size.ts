/**
 * Copyright (c) Siemens 2016 - 2026
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

/** Options for the resize signal. */
export interface ObserverOptions {
  /** Sets which box model the observer uses. */
  box?: ResizeObserverBoxOptions;
}

type SourceElement = Element | ElementRef<Element>;
type Source = SourceElement | Signal<SourceElement | undefined | null>;

/**
 * Creates a read-only signal backed by a `ResizeObserver` that tracks the size
 * of the given element. The signal emits the raw `ResizeObserverEntry[]` array
 * each time the observer fires, starting with an empty array.
 *
 * Use `computed()` to derive specific dimensions from the entries:
 *
 * @example
 * ```ts
 * private readonly resizeEntries = observeElementSize(this.elementRef);
 * readonly width = computed(
 *   () => this.resizeEntries().at(0)?.contentBoxSize.at(0)?.inlineSize ?? 0
 * );
 * ```
 *
 * The source can be a static element or a signal that resolves to one.
 * When a signal source emits a new element, the observer automatically
 * disconnects from the previous element and re-attaches to the new one,
 * resetting the signal to an empty array.
 *
 * On the server or when `ResizeObserver` is unavailable, the returned
 * signal permanently holds an empty array.
 *
 * The observer is automatically disconnected when the enclosing
 * `DestroyRef` is destroyed.
 *
 * @param source - An `Element`, `ElementRef`, or a signal resolving to one.
 * @param opt - Optional configuration for the underlying `ResizeObserver`.
 * @returns A read-only signal emitting `ResizeObserverEntry[]`.
 * @remarks Must be called within an injection context (e.g. constructor,
 * field initializer, or `runInInjectionContext`).
 */
export const observeElementSize = (
  source: Source,
  opt?: ObserverOptions
): Signal<ResizeObserverEntry[]> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || typeof ResizeObserver === 'undefined') {
    return signal([]).asReadonly();
  }

  const options = { box: opt?.box ?? 'content-box' };
  const sizeSignal = signal<ResizeObserverEntry[]>([]);
  const observer = new ResizeObserver(entries => sizeSignal.set(entries));
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  if (isSignal(source)) {
    let currentEl: null | undefined | Element | ElementRef<Element>;
    effect(() => {
      const nextEl = source();
      if (nextEl !== currentEl) {
        currentEl = nextEl;
        // Reset entries every time the element changes
        sizeSignal.set([]);
        observer.disconnect();
        if (currentEl) {
          observer.observe(getElement(currentEl), options);
        }
      }
    });
  } else {
    observer.observe(getElement(source), options);
  }

  return sizeSignal.asReadonly();
};

const getElement = (source: SourceElement): Element =>
  source instanceof Element ? source : source.nativeElement;
