/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { inject, NgZone, PLATFORM_ID } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

import { getElementSize } from './si-resize-observer-utils';

export interface ElementDimensions {
  /** The width of the element */
  width: number;
  /** The height of the element */
  height: number;
}

interface ResizeEvent {
  target: Element;
  borderBoxSize?: readonly ResizeObserverSize[];
  contentBoxSize?: readonly ResizeObserverSize[];
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

interface ObserverOpts {
  element: Element;
  throttle: number;
  emitInitial?: boolean;
  emitImmediate?: boolean;
}

export class SiResizeSubscriptions {
  private readonly zone = inject(NgZone);
  private readonly listeners = new Map<Element, Listener>();
  private readonly timerQueue = new Map<number, QueueEntry[]>();
  private readonly box: 'content-box' | 'border-box';
  private readonly resizeObserver?: ResizeObserver;

  constructor(box: 'content-box' | 'border-box') {
    this.box = box;
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (!isBrowser || !ResizeObserver) {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) =>
      entries.forEach(entry => this.handleElement(entry))
    );
  }

  createObservable(opt: ObserverOpts): Observable<ElementDimensions> {
    const { element, throttle, emitInitial, emitImmediate } = opt;
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

  /**
   * @internal
   */
  checkAll(): void {
    this.listeners.forEach(entry => this.handleElement({ target: entry.element }));
  }

  private emitSize(element: Element, entry: ResizeSubscriber, force = false): void {
    const dimensions = getElementSize(element, this.box);
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

  private handleElement(event: ResizeEvent): void {
    const element = event.target;
    const entry = this.listeners.get(element);
    if (!entry) {
      this.resizeObserver?.unobserve(element);
      return;
    }
    entry.subscribers.forEach(sub => this.handleResizeSubscriber(event, sub));
  }

  private handleResizeSubscriber(event: ResizeEvent, entry: ResizeSubscriber): void {
    if (entry.blocked) {
      return;
    }
    const element = event.target;
    if (entry.emitImmediate) {
      this.schedule(0, element, entry, false);
    }
    this.schedule(entry.throttle, element, entry, true);
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

  private subscriberAdded(
    entry: Listener,
    subscriber: ResizeSubscriber,
    emitInitial?: boolean
  ): void {
    entry.subscribers.push(subscriber);
    if (entry.subscribers.length === 1) {
      this.resizeObserver?.observe(entry.element, { box: this.box });
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

  private unschedule(entry: ResizeSubscriber): void {
    const queued = this.timerQueue.get(entry.throttle);
    if (queued) {
      const index = queued.findIndex(q => q.subscriber === entry);
      if (index > -1) {
        queued.splice(index, 1);
      }
    }
  }
}
