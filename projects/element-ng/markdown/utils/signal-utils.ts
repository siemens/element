/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { effect, signal, Signal, untracked } from '@angular/core';

/** Options for `computedAsync()` */
export interface ComputedAsyncOptions<T, R> {
  /** Params function, params will be passed to the `computation` function. This is tracked. */
  params: () => R;
  /** Computation function. This is `untracked()`, params from the `params` function are passed */
  computation: (params: R) => Promise<T>;
  /** Initial value of the `computedAsync` signal. */
  initial: T;
}

/**
 * Computed value, but async. This exists because the `resource()` API is not suitable. During
 * loading, the value changes to `undefined`. The proposed solution of resource snapshots and
 * a `withPreviousValue()` function that uses `resourceFromSnapshots()` isn't suitable either
 * because it's experimental.
 *
 * @param options - the options
 * @returns readonly signal
 */
export const computedAsync = <T, R>(options: ComputedAsyncOptions<T, R>): Signal<T> => {
  const resultSignal = signal<T>(options.initial);

  effect(async onCleanup => {
    const params = options.params();

    let destroyed = false;
    untracked(async () => {
      const result = await options.computation(params);
      if (!destroyed) {
        resultSignal.set(result);
      }
    });

    onCleanup(() => (destroyed = true));
  });

  return resultSignal.asReadonly();
};

/**
 * A readonly throttled version of a signal. Emits at most every `interval` milliseconds
 * @param source - the source signal
 * @param interval - the interval
 * @param immediatelyEmitFirstChange - immediately emit the first change
 * @returns A readonly signal
 */
export const throttledSignal = <T>(
  source: Signal<T>,
  interval: number,
  immediatelyEmitFirstChange = true
): Signal<T> => {
  const resultSignal = signal(source());
  let lastEmitted = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let firstChangeSeen = false;

  effect(onCleanup => {
    const value = source();
    const now = Date.now();

    if (!firstChangeSeen && immediatelyEmitFirstChange) {
      firstChangeSeen = true;
      resultSignal.set(value);
      return;
    }

    if (now - lastEmitted >= interval) {
      resultSignal.set(value);
      lastEmitted = now;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    } else {
      timer ??= setTimeout(
        () => {
          resultSignal.set(source());
          lastEmitted = Date.now();
          timer = null;
        },
        interval - (now - lastEmitted)
      );
    }

    onCleanup(() => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    });
  });

  return resultSignal.asReadonly();
};
