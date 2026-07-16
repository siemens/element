/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { signal, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { computedAsync, throttledSignal } from './signal-utils';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(promiseResolve => (resolve = promiseResolve));
  return { promise, resolve };
};

// Lets a resolved promise resume the await in computedAsync before flushing Angular effects.
const yieldMicrotask = (): Promise<void> => Promise.resolve();

describe('signal utilities', () => {
  describe('computedAsync', () => {
    const source = signal('first');
    const computations = new Map<string, Deferred<string>>();
    let result: Signal<string>;

    beforeEach(() => {
      source.set('first');
      computations.clear();
      computations.set('first', deferred<string>());
      result = TestBed.runInInjectionContext(() =>
        computedAsync({
          params: () => source(),
          computation: currentSource => computations.get(currentSource)!.promise,
          initial: 'initial'
        })
      );
      TestBed.tick();
    });

    it('retains its previous value while computing replacement params', async () => {
      const first = computations.get('first')!;
      first.resolve('first result');
      await yieldMicrotask();
      TestBed.tick();

      computations.set('second', deferred<string>());
      source.set('second');
      TestBed.tick();

      expect(result()).toBe('first result');

      computations.get('second')!.resolve('second result');
      await yieldMicrotask();
      TestBed.tick();

      expect(result()).toBe('second result');
    });

    it('ignores results from superseded computations', async () => {
      computations.set('second', deferred<string>());
      source.set('second');
      TestBed.tick();

      computations.get('second')!.resolve('second result');
      await yieldMicrotask();
      TestBed.tick();

      computations.get('first')!.resolve('stale first result');
      await yieldMicrotask();
      TestBed.tick();

      expect(result()).toBe('second result');
    });
  });

  describe('throttledSignal', () => {
    const source = signal('initial');
    let result: Signal<string>;

    beforeEach(() => {
      vi.useFakeTimers();
      source.set('initial');
      result = TestBed.runInInjectionContext(() => throttledSignal(source, 100));
      TestBed.tick();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('immediately emits the first source change by default', () => {
      source.set('first update');
      TestBed.tick();

      expect(result()).toBe('first update');
    });

    it('emits the latest source value once the interval elapses when immediate emission is disabled', () => {
      result = TestBed.runInInjectionContext(() => throttledSignal(source, 100, false));
      TestBed.tick();

      source.set('first update');
      TestBed.tick();
      vi.advanceTimersByTime(50);

      source.set('second update');
      TestBed.tick();
      vi.advanceTimersByTime(49);
      expect(result()).toBe('initial');

      vi.advanceTimersByTime(1);
      expect(result()).toBe('second update');
    });
  });
});
