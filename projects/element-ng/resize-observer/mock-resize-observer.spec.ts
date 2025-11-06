/**
 * Copyright (c) Siemens 2016 - 2025
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
}
export const mockResizeObserver = (): void => {
  resizeObserver = (window as any).ResizeObserver;
  (window as any).ResizeObserver = MockResizeObserver;
};

export const restoreResizeObserver = (): void => {
  (window as any).ResizeObserver = resizeObserver;
};
/**
 * `ResizeObserver` mock for testing purposes.
 */
export class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  private callback: ResizeObserverCallback;
  observed: [Element, ResizeObserverOptions | undefined][] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  disconnect = jasmine.createSpy('disconnect').and.callFake(() => (this.observed = []));

  observe = jasmine
    .createSpy('observe')
    .and.callFake((target: Element, options?: ResizeObserverOptions) =>
      this.observed.push([target, options])
    );

  unobserve = jasmine
    .createSpy('unobserve')
    .and.callFake(
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
        const e: ResizeObserverEntry = {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [{ inlineSize, blockSize }],
          contentBoxSize: [{ inlineSize, blockSize }],
          devicePixelContentBoxSize: [{ inlineSize, blockSize }]
        };
        // Mock clientWidth and clientHeight to simulate size change
        if (instance.observed.filter(x => !!x).length !== 0) {
          instance.callback?.([e], instance);
        }
      }
    }
  }
}
