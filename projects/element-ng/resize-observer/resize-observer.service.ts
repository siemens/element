/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SiResizeSubscriptions } from './si-resize-subscriptions';

/** Represents the dimensions of the observed element */
export interface ElementDimensions {
  /** The width (inline-size) of the element */
  width: number;
  /** The height (block-size) of the element */
  height: number;
}

/**
 * A service wrapping `ResizeObserver`. This is a service for those reasons:
 * - only one `ResizeObserver` should be used for performance reason.
 * - For Angular change detection to work, explicit `ngZone` calls are necessary
 * - Observable stream
 */
@Injectable({
  providedIn: 'root'
})
export class ResizeObserverService {
  private readonly observers = {
    'content-box': new SiResizeSubscriptions('content-box'),
    'border-box': new SiResizeSubscriptions('border-box')
  };

  /**
   * Observe the size of an element. Returns an observable with the changes.
   * @param element - The element to observe
   * @param throttle - Throttle time in ms. Will emit this time after the resize
   * @param emitInitial - Emit the initial size after subscribe?
   * @param emitImmediate - Emit an event immediately after the size changes. Useful e.g. for visibility checks.
   * @param box - Which box size to observe, the default is 'content-box'
   */
  observe(
    element: Element,
    throttle: number,
    emitInitial?: boolean,
    emitImmediate?: boolean,
    box?: 'content-box' | 'border-box'
  ): Observable<ElementDimensions> {
    const observer = this.observers[box ?? 'content-box'];
    return observer.createObservable({
      element,
      throttle,
      emitInitial,
      emitImmediate
    });
  }

  /**
   * check size on all observed elements. Only use in testing!
   * @deprecated Will be removed in major version 50! For testing purposes use the resize observer mock:
   *
   * ```ts
   * beforeEach(() => mockResizeObserver());
   * afterEach(() => restoreResizeObserver());
   * it('should trigger resize', () => {
   *   // For all observed elements
   *   MockResizeObserver.triggerResize({});
   *   // For specific HTML element
   *   MockResizeObserver.triggerResize({ target: myElement });
   * });
   * ```

   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _checkAll(): void {
    this.observers['content-box'].checkAll();
    this.observers['border-box'].checkAll();
  }
}
