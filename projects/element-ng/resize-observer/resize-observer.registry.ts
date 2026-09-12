/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';

type ResizeObserverSink = (entry: ResizeObserverEntry) => void;

interface Listener {
  element: Element;
  subscribers: Map<ResizeObserverBoxOptions, Set<ResizeObserverSink>>;
  observedBox?: ResizeObserverBoxOptions;
}

/** @internal */
@Injectable({ providedIn: 'root' })
export class ResizeObserverRegistry implements OnDestroy {
  private readonly listeners = new Map<Element, Listener>();
  private readonly zone = inject(NgZone);
  private resizeObserver?: ResizeObserver;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID)) || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver = new ResizeObserver(entries =>
      this.zone.run(() => entries.forEach(entry => this.emit(entry)))
    );
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.listeners.clear();
  }

  observe(element: Element, box: ResizeObserverBoxOptions, sink: ResizeObserverSink): () => void {
    const listener = this.getListener(element);
    let subscribers = listener.subscribers.get(box);
    if (!subscribers) {
      subscribers = new Set();
      listener.subscribers.set(box, subscribers);
    }
    subscribers.add(sink);
    this.updateObservation(listener, true);

    return () => {
      if (!subscribers.delete(sink)) {
        return;
      }
      if (subscribers.size === 0) {
        listener.subscribers.delete(box);
      }
      this.updateObservation(listener);
    };
  }

  private getListener(element: Element): Listener {
    let listener = this.listeners.get(element);
    if (!listener) {
      listener = { element, subscribers: new Map() };
      this.listeners.set(element, listener);
    }
    return listener;
  }

  private updateObservation(listener: Listener, refresh = false): void {
    const box = this.getObservedBox(listener);
    if (!box) {
      this.resizeObserver?.unobserve(listener.element);
      this.listeners.delete(listener.element);
      listener.observedBox = undefined;
      return;
    }

    if (listener.observedBox !== box || refresh) {
      this.resizeObserver?.observe(listener.element, { box });
      listener.observedBox = box;
    }
  }

  private getObservedBox(listener: Listener): ResizeObserverBoxOptions | undefined {
    if (listener.subscribers.has('content-box')) {
      return 'content-box';
    }
    if (listener.subscribers.has('border-box')) {
      return 'border-box';
    }
    if (listener.subscribers.has('device-pixel-content-box')) {
      return 'device-pixel-content-box';
    }
    return undefined;
  }

  private emit(entry: ResizeObserverEntry): void {
    const listener = this.listeners.get(entry.target);
    if (!listener) {
      this.resizeObserver?.unobserve(entry.target);
      return;
    }
    listener.subscribers.forEach(subscribers => subscribers.forEach(sink => sink(entry)));
  }
}
