/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

export interface ElementDimensions {
  width: number;
  height: number;
}

interface ResizeSubscriber {
  sub: Subscriber<ElementDimensions>;
  dim?: ElementDimensions;
  throttle: number;
  blocked: boolean;
  emitImmediate?: boolean;
}

interface Listener {
  element: Element;
  subscribers: ResizeSubscriber[];
}

interface QueueEntry {
  element: Element;
  subscriber: ResizeSubscriber;
  unblock: boolean;
  force: boolean;
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
  private listeners = new Map<Element, Listener>();
  private resizeObserver?: ResizeObserver;
  private timerQueue = new Map<number, QueueEntry[]>();
  private zone = inject(NgZone);

  constructor() {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (!isBrowser || !ResizeObserver) {
      return;
    }
    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) =>
      entries.forEach(entry => this.handleElement(entry.target))
    );
  }

  /**
   * Observe the size of an element. Returns an observable with the changes.
   * @param element - The element to observe
   * @param throttle - Throttle time in ms. Will emit this time after the resize
   * @param emitInitial - Emit the initial size after subscribe?
   * @param emitImmediate - Emit an event immediately after the size changes. Useful e.g. for visibility checks.
   */
  observe(
    element: Element,
    throttle: number,
    emitInitial?: boolean,
    emitImmediate?: boolean
  ): Observable<ElementDimensions> {
    let entry = this.listeners.get(element);
    if (!entry) {
      entry = { element, subscribers: [] };
      this.listeners.set(element, entry);
    }

    return new Observable<ElementDimensions>(subscriber => {
      const sub: ResizeSubscriber = {
        sub: subscriber,
        dim: undefined,
        throttle,
        blocked: false,
        emitImmediate
      };
      this.subscriberAdded(entry!, sub, emitInitial);
      return () => this.subscriberRemoved(entry!, sub);
    });
  }

  private subscriberAdded(
    entry: Listener,
    subscriber: ResizeSubscriber,
    emitInitial?: boolean
  ): void {
    entry.subscribers.push(subscriber);
    if (entry.subscribers.length === 1) {
      this.resizeObserver?.observe(entry.element);
    }

    if (emitInitial) {
      this.schedule(0, entry.element, subscriber, false, true);
    }
  }

  private subscriberRemoved(entry: Listener, subscriber: ResizeSubscriber): void {
    const index = entry.subscribers.indexOf(subscriber);
    if (index >= 0) {
      entry.subscribers.splice(index, 1);
    }
    if (entry.subscribers.length === 0) {
      // no more subscribers, tear down everything
      this.resizeObserver?.unobserve(entry.element);
      this.listeners.delete(entry.element);
    }
    this.unschedule(subscriber);
    // close down, no re-subscription possible
    subscriber.sub.complete();
  }

  private handleElement(element: Element): void {
    const entry = this.listeners.get(element);
    if (!entry) {
      this.resizeObserver?.unobserve(element);
      return;
    }
    entry.subscribers.forEach(sub => this.handleResizeSubscriber(element, sub));
  }

  private handleResizeSubscriber(element: Element, entry: ResizeSubscriber): void {
    if (entry.blocked) {
      return;
    }
    if (entry.emitImmediate) {
      this.schedule(0, element, entry, false);
    }
    this.schedule(entry.throttle, element, entry, true);
  }

  private emitSize(element: Element, entry: ResizeSubscriber, force = false): void {
    const dimensions = { width: element.clientWidth, height: element.clientHeight };
    if (
      !force &&
      entry.dim?.width === dimensions.width &&
      entry.dim?.height === dimensions.height
    ) {
      // Prevent spurious emissions. Subpixels and all..
      return;
    }
    entry.dim = dimensions;
    entry.sub.next(dimensions);
  }

  private schedule(
    timeout: number,
    element: Element,
    subscriber: ResizeSubscriber,
    unblock: boolean,
    force = false
  ): void {
    if (unblock) {
      subscriber.blocked = true;
    }

    let queue = this.timerQueue.get(timeout);
    if (!queue) {
      queue = [];
      this.timerQueue.set(timeout, queue);
      setTimeout(() => {
        this.timerQueue.delete(timeout);
        this.processQueue(queue!);
      }, timeout);
    }

    queue.push({ element, subscriber, unblock, force });
  }

  private unschedule(entry: ResizeSubscriber): void {
    const queued = this.timerQueue.get(entry.throttle);
    if (queued) {
      const index = queued.findIndex(q => q.subscriber === entry);
      if (index > -1) {
        queued.splice(index, 1);
      }
    }
  }

  private processQueue(queue: QueueEntry[]): void {
    this.zone.run(() => {
      queue?.forEach(q => {
        if (q.unblock) {
          q.subscriber.blocked = false;
        }
        this.emitSize(q.element, q.subscriber, q.force);
      });
    });
  }

  /**
   * check size on all observed elements. Only use in testing!
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _checkAll(): void {
    this.listeners.forEach(entry => this.handleElement(entry.element));
  }
}
