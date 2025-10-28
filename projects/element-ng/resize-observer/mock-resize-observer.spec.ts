/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

let resizeObserver: ResizeObserver;
export interface TriggerResize {
  target: HTMLElement;
  inlineSize: number;
  blockSize: number;
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
  static instance: MockResizeObserver;
  private callback: ResizeObserverCallback;
  observed: [Element, ResizeObserverOptions | undefined][] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instance = this;
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

  static triggerResize({ target, inlineSize, blockSize }: TriggerResize): void {
    target.style.width = `${inlineSize}px`;
    target.style.height = `${blockSize}px`;
    const e: ResizeObserverEntry = {
      target,
      contentRect: target.getBoundingClientRect(),
      borderBoxSize: [{ inlineSize, blockSize }],
      contentBoxSize: [{ inlineSize, blockSize }],
      devicePixelContentBoxSize: [{ inlineSize, blockSize }]
    };
    // Mock clientWidth and clientHeight to simulate size change
    const instance = MockResizeObserver.instance;
    if (instance.observed.filter(x => !!x).length !== 0) {
      instance.callback?.([e], instance);
    }
  }
}
