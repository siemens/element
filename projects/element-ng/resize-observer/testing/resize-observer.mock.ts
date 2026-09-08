/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

let resizeObserver: ResizeObserver;
export interface ResizeOptions {
  /** Specific target element otherwise all observed elements will be resized */
  target?: HTMLElement;
  /** New inline size otherwise the element's current inline size will be used */
  inlineSize?: number;
  /** New block size otherwise the element's current block size will be used */
  blockSize?: number;
  /** Explicit content-box fragments, including an empty fragment list. */
  contentBoxSize?: ResizeObserverSize[];
  /** Explicit border-box fragments, including an empty fragment list. */
  borderBoxSize?: ResizeObserverSize[];
  /** Explicit device-pixel content-box fragments, including an empty fragment list. */
  devicePixelContentBoxSize?: ResizeObserverSize[];
}
export const mockResizeObserver = (): void => {
  resizeObserver = (window as any).ResizeObserver;
  MockResizeObserver.instances.length = 0;
  (window as any).ResizeObserver = MockResizeObserver;
};

export const restoreResizeObserver = (): void => {
  (window as any).ResizeObserver = resizeObserver;
};
/**
 * `ResizeObserver` mock for testing purposes.
 */
export class MockResizeObserver {
  /** @defaultValue [] */
  static instances: MockResizeObserver[] = [];
  private callback: ResizeObserverCallback;
  /** @defaultValue [] */
  observed: [Element, ResizeObserverOptions | undefined][] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  /**
   * @defaultValue
   * ```
   * vi.fn(() => (this.observed = []))
   * ```
   */
  disconnect = vi.fn(() => (this.observed = []));

  /**
   * @defaultValue
   * ```
   * vi.fn((target: Element, options?: ResizeObserverOptions) => {
   *   const index = this.observed.findIndex(([element]) => element === target);
   *   if (index === -1) {
   *     this.observed.push([target, options]);
   *   } else {
   *     this.observed[index] = [target, options];
   *   }
   * })
   * ```
   */
  observe = vi.fn((target: Element, options?: ResizeObserverOptions) => {
    const index = this.observed.findIndex(([element]) => element === target);
    if (index === -1) {
      this.observed.push([target, options]);
    } else {
      this.observed[index] = [target, options];
    }
  });

  /**
   * @defaultValue
   * ```
   * vi.fn(
  (target: Element) => (this.observed = this.observed.filter(x => x[0] !== target))
  )
   * ```
   */
  unobserve = vi.fn(
    (target: Element) => (this.observed = this.observed.filter(x => x[0] !== target))
  );

  /**
   * Simulate a resize event for the observed elements.
   * If a target is provided, only that element is resized otherwise all observed elements are resized.
   */
  static triggerResize(options: ResizeOptions): void {
    for (const instance of MockResizeObserver.instances) {
      const elements = options.target
        ? [options.target]
        : instance.observed.map(x => x[0] as HTMLElement);
      for (const target of elements) {
        const inlineSize = options.inlineSize ?? target.clientWidth;
        const blockSize = options.blockSize ?? target.clientHeight;
        const defaultBoxSize = [{ inlineSize, blockSize }];
        const e: ResizeObserverEntry = {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: options.borderBoxSize ?? defaultBoxSize,
          contentBoxSize: options.contentBoxSize ?? defaultBoxSize,
          devicePixelContentBoxSize: options.devicePixelContentBoxSize ?? defaultBoxSize
        };
        // Mock clientWidth and clientHeight to simulate size change
        if (instance.observed.filter(x => !!x).length !== 0) {
          instance.callback?.([e], instance);
        }
      }
    }
  }
}
