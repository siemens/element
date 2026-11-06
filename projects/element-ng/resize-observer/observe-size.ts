/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  computed,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  PLATFORM_ID,
  Signal,
  untracked
} from '@angular/core';

import { ElementDimensions, ResizeObserverService } from './resize-observer.service';

/**
 * An element or an Angular element reference whose size can be observed.
 * @experimental
 */
export type ObserveSizeTarget = Element | ElementRef<Element>;

/**
 * Options for {@link observeSize}. Initial measurements are always enabled.
 * @experimental
 */
export interface ObserveSizeOptions {
  /**
   * Throttle duration in milliseconds.
   * @defaultValue 100
   */
  throttle?: number;
  /**
   * Also emit immediately on resize, before the throttled update.
   * @defaultValue false
   */
  emitImmediate?: boolean;
  /** Injector owning the observation, required outside an injection context. */
  injector?: Injector;
}

/**
 * Returns a signal of the target's client width and height, updating when it resizes.
 *
 * @example
 * ```ts
 * readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
 * readonly size = observeSize(this.panel);
 * ```
 * @experimental
 */
export function observeSize(
  target: ObserveSizeTarget | (() => ObserveSizeTarget),
  options?: ObserveSizeOptions
): Signal<ElementDimensions>;
/** @experimental */
export function observeSize(
  target: ObserveSizeTarget | undefined | (() => ObserveSizeTarget | undefined),
  options?: ObserveSizeOptions
): Signal<ElementDimensions | undefined>;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions -- Function overloads preserve target-dependent return types.
export function observeSize(
  target: ObserveSizeTarget | undefined | (() => ObserveSizeTarget | undefined),
  options?: ObserveSizeOptions
): Signal<ElementDimensions | undefined> {
  const injector = options?.injector ?? inject(Injector);
  const isBrowser = isPlatformBrowser(injector.get(PLATFORM_ID));
  const service = isBrowser ? injector.get(ResizeObserverService) : undefined;
  const element = computed(() => {
    const value = typeof target === 'function' ? target() : target;
    return value instanceof ElementRef ? value.nativeElement : value;
  });
  const size = linkedSignal(() => {
    const current = element();
    if (!current) {
      return undefined;
    }
    return isBrowser
      ? { width: current.clientWidth, height: current.clientHeight }
      : { width: 0, height: 0 };
  });

  afterRenderEffect(
    onCleanup => {
      const current = element();
      if (!current || !service) {
        return;
      }
      const subscription = service
        .observe(current, options?.throttle ?? 100, true, options?.emitImmediate ?? false)
        .subscribe(dimensions => {
          untracked(() => {
            // A reactive target may change before the render effect can unsubscribe.
            if (element() === current) {
              size.set(dimensions);
            }
          });
        });
      onCleanup(() => subscription.unsubscribe());
    },
    { injector }
  );

  return size.asReadonly();
}
