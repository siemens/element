/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/**
 * Opt-in diagnostic: `LEAK_CHECK=1 CI=true pnpm lib:test`.
 * Fails the first test after which shared document state differs from the state at start-up.
 */
import { aroundEach, vi } from 'vitest';

type ListenerKey = string;

interface Tracker {
  listeners: Map<EventTarget, Map<ListenerKey, Set<unknown>>>;
  // Maps a timer id to the call site that created it.
  intervals: Map<unknown, string>;
  longTimeouts: Map<unknown, string>;
  // Observers watching the document, html or body keep firing in later tests.
  // Held weakly, so tracking does not keep an otherwise collectable observer alive.
  observers: Map<WeakRef<object>, Map<Node, string>>;
}

interface LeakCheckState {
  baseline: Record<string, string>;
  globals: Record<string, unknown>;
  seen: Set<string>;
  setTimeout: typeof setTimeout;
}

// Zero-delay timers, e.g. from the rxjs async scheduler, are pending at the end of most tests.
// A long timer is still pending only if something leaked it.
const LONG_TIMEOUT_MS = 1000;

// Defined by Angular and third-party libraries on first use, not by specs.
const libraryGlobals = new Set([
  '$localize',
  'devtoolsFormatters',
  'ng',
  'ngDevMode',
  'fastdom',
  'injected'
]);

const holder = globalThis as Record<symbol, unknown>;

const callSite = (): string =>
  (new Error().stack ?? '')
    .split('\n')
    .filter(
      line =>
        !line.includes('vitest-leak-check') &&
        !line.includes('node_modules') &&
        !line.includes('/deps/')
    )
    .slice(1, 5)
    .map(line => line.trim().replace(/\?.*?:/, ':'))
    .join(' < ');

// Patches are installed once per window and before the baseline, so they never show up as a diff.
const install = (): Tracker => {
  const result: Tracker = {
    listeners: new Map(),
    intervals: new Map(),
    longTimeouts: new Map(),
    observers: new Map()
  };
  const proto = EventTarget.prototype;
  const add = proto.addEventListener;
  const remove = proto.removeEventListener;
  const isDocumentNode = (target: unknown): boolean =>
    target === document || target === document.documentElement || target === document.body;
  const isTracked = (target: EventTarget): boolean =>
    target === window ||
    isDocumentNode(target) ||
    target === window.visualViewport ||
    target instanceof MediaQueryList;
  const keyOf = (type: string, options?: boolean | EventListenerOptions): ListenerKey =>
    `${type}${(typeof options === 'object' ? options.capture : options) ? '#capture' : ''}`;

  proto.addEventListener = function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    // One-off and abortable listeners remove themselves, so they cannot leak.
    const selfRemoving = typeof options === 'object' && (options.once || options.signal);
    if (listener && !selfRemoving && isTracked(this)) {
      const byKey = result.listeners.get(this) ?? new Map<ListenerKey, Set<unknown>>();
      const key = keyOf(type, options);
      byKey.set(key, (byKey.get(key) ?? new Set()).add(listener));
      result.listeners.set(this, byKey);
    }
    return add.call(this, type, listener, options);
  };
  proto.removeEventListener = function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    result.listeners.get(this)?.get(keyOf(type, options))?.delete(listener);
    return remove.call(this, type, listener, options);
  };
  // The legacy MediaQueryList API does not go through EventTarget.prototype.
  const mediaProto = MediaQueryList.prototype;
  const addListener = mediaProto.addListener;
  const removeListener = mediaProto.removeListener;
  mediaProto.addListener = function (this: MediaQueryList, listener) {
    if (listener) {
      const byKey = result.listeners.get(this) ?? new Map<ListenerKey, Set<unknown>>();
      byKey.set('change', (byKey.get('change') ?? new Set()).add(listener));
      result.listeners.set(this, byKey);
    }
    return addListener.call(this, listener);
  };
  mediaProto.removeListener = function (this: MediaQueryList, listener) {
    result.listeners.get(this)?.get('change')?.delete(listener);
    return removeListener.call(this, listener);
  };

  const observerRefs = new WeakMap<object, WeakRef<object>>();
  for (const observerType of [ResizeObserver, IntersectionObserver, MutationObserver]) {
    const observerProto = observerType.prototype as {
      observe: (target: Node, ...args: unknown[]) => void;
      unobserve?: (target: Node) => void;
      disconnect: () => void;
    };
    const observe = observerProto.observe;
    const unobserve = observerProto.unobserve;
    const disconnect = observerProto.disconnect;
    const targetsOf = (observer: object): Map<Node, string> | undefined => {
      const ref = observerRefs.get(observer);
      return ref && result.observers.get(ref);
    };
    observerProto.observe = function (this: object, target: Node, ...args: unknown[]) {
      const site = isDocumentNode(target) ? callSite() : '';
      // Playwright observes the document for its own bookkeeping.
      if (site && !site.includes('InjectedScript')) {
        let ref = observerRefs.get(this);
        if (!ref) {
          ref = new WeakRef(this);
          observerRefs.set(this, ref);
          result.observers.set(ref, new Map());
        }
        result.observers
          .get(ref)!
          .set(target, `${observerType.name}(${target.nodeName.toLowerCase()}) at ${site}`);
      }
      return observe.call(this, target, ...args);
    };
    if (unobserve) {
      observerProto.unobserve = function (this: object, target: Node) {
        targetsOf(this)?.delete(target);
        return unobserve.call(this, target);
      };
    }
    observerProto.disconnect = function (this: object) {
      targetsOf(this)?.clear();
      return disconnect.call(this);
    };
  }

  const setIntervalOriginal = globalThis.setInterval;
  const clearIntervalOriginal = globalThis.clearInterval;
  const setTimeoutOriginal = globalThis.setTimeout;
  const clearTimeoutOriginal = globalThis.clearTimeout;
  globalThis.setInterval = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
    const id = setIntervalOriginal(handler, delay, ...args);
    if ((delay ?? 0) >= LONG_TIMEOUT_MS) {
      result.intervals.set(id, callSite());
    }
    return id;
  }) as typeof setInterval;
  globalThis.clearInterval = ((id?: number) => {
    result.intervals.delete(id);
    return clearIntervalOriginal(id);
  }) as typeof clearInterval;
  globalThis.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
    if ((delay ?? 0) < LONG_TIMEOUT_MS || typeof handler !== 'function') {
      return setTimeoutOriginal(handler, delay, ...args);
    }
    const id: unknown = setTimeoutOriginal(
      (...handlerArgs: unknown[]) => {
        result.longTimeouts.delete(id);
        return handler(...handlerArgs);
      },
      delay,
      ...args
    );
    result.longTimeouts.set(id, callSite());
    return id;
  }) as typeof setTimeout;
  globalThis.clearTimeout = ((id?: number) => {
    result.longTimeouts.delete(id);
    return clearTimeoutOriginal(id);
  }) as typeof clearTimeout;
  return result;
};

const tracker = (holder[Symbol.for('@siemens/element-ng/leak-check/tracker')] ??=
  install()) as Tracker;

const attributes = (element: Element): string =>
  Array.from(element.attributes)
    // Restoring a class or style often leaves an empty attribute behind, which is harmless.
    .filter(attr => attr.value !== '')
    .map(attr => `${attr.name}=${attr.value}`)
    .sort()
    .join(' ');

const describeChildren = (parent: Element, ignore?: string): string => {
  const counts = new Map<string, number>();
  for (const child of Array.from(parent.children)) {
    if (ignore && child.matches(ignore)) {
      continue;
    }
    // Generated ids such as `root12` or `cdk-overlay-3` differ between runs.
    const id = child.id ? `#${child.id.replace(/\d+$/, 'N')}` : '';
    // Style tags are told apart by their content, which names the code that added them.
    const detail = child.matches('style')
      ? `{${(child.textContent ?? '')
          .replace(/[\s,]+/g, ' ')
          .trim()
          .slice(0, 50)}}`
      : '';
    const name = child.tagName.toLowerCase() + id + detail;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => `${name}x${count}`)
    .sort()
    .join(',');
};

// Registered once by a library on first use and never removed.
const libraryListeners = new Set(['document.visibilitychange']);

const describeListeners = (): string =>
  Array.from(tracker.listeners, ([target, byKey]) => {
    const name =
      target === window
        ? 'window'
        : target === document
          ? 'document'
          : target === window.visualViewport
            ? 'visualViewport'
            : target instanceof MediaQueryList
              ? `matchMedia(${target.media})`
              : (target as Element).tagName;
    return Array.from(byKey)
      .filter(([key, set]) => set.size > 0 && !libraryListeners.has(`${name}.${key}`))
      .map(([key, set]) => `${name}.${key}x${set.size}`);
  })
    .flat()
    .sort()
    .join(',');

// Handlers assigned to `on*` properties, e.g. `window.onresize = ...`.
const handlerProperties = (): string => {
  const assigned = new Set<string>();
  for (const [name, target] of Object.entries({ window, document, body: document.body })) {
    for (let proto: object | null = target; proto; proto = Object.getPrototypeOf(proto)) {
      Object.keys(proto)
        .filter(key => key.startsWith('on') && (target as Record<string, unknown>)[key])
        .forEach(key => assigned.add(`${name}.${key}`));
    }
  }
  return Array.from(assigned).sort().join(',');
};

const storage = (area: Storage): string =>
  JSON.stringify(
    Object.keys(area)
      .sort()
      .map(key => [key, area.getItem(key)])
  );

const getter = (proto: object, property: string): unknown =>
  Object.getOwnPropertyDescriptor(proto, property)?.get;

// Globals that specs spy on or replace; a changed identity means a spy or mock was not restored.
const trackedGlobals = (): Record<string, unknown> => ({
  Date,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame,
  cancelAnimationFrame,
  queueMicrotask,
  matchMedia,
  getComputedStyle,
  getSelection: window.getSelection,
  open: window.open,
  scrollTo: window.scrollTo,
  fetch,
  structuredClone,
  FileReader,
  XMLHttpRequest,
  ResizeObserver,
  IntersectionObserver,
  MutationObserver,
  'Intl.DateTimeFormat': Intl.DateTimeFormat,
  'Intl.NumberFormat': Intl.NumberFormat,
  'Math.random': Math.random,
  'performance.now': performance.now,
  'IntersectionObserver.prototype.observe': IntersectionObserver.prototype.observe,
  'Element.prototype.getBoundingClientRect': Element.prototype.getBoundingClientRect,
  'Element.prototype.scrollIntoView': Element.prototype.scrollIntoView,
  'Element.prototype.animate': Element.prototype.animate,
  'HTMLElement.prototype.focus': HTMLElement.prototype.focus,
  'HTMLElement.prototype.blur': HTMLElement.prototype.blur,
  'HTMLElement.prototype.offsetWidth': getter(HTMLElement.prototype, 'offsetWidth'),
  'HTMLElement.prototype.offsetHeight': getter(HTMLElement.prototype, 'offsetHeight'),
  'Element.prototype.clientWidth': getter(Element.prototype, 'clientWidth'),
  'Element.prototype.clientHeight': getter(Element.prototype, 'clientHeight'),
  'Element.prototype.scrollWidth': getter(Element.prototype, 'scrollWidth'),
  'Element.prototype.scrollHeight': getter(Element.prototype, 'scrollHeight'),
  'Storage.prototype.getItem': Storage.prototype.getItem,
  'Storage.prototype.setItem': Storage.prototype.setItem,
  'document.createElement': document.createElement,
  'document.querySelector': document.querySelector,
  'document.getElementById': document.getElementById,
  'document.addEventListener': document.addEventListener,
  'document.removeEventListener': document.removeEventListener,
  'window.addEventListener': window.addEventListener,
  'Navigator.prototype.language': getter(Navigator.prototype, 'language'),
  'Navigator.prototype.userAgent': getter(Navigator.prototype, 'userAgent'),
  'Navigator.prototype.platform': getter(Navigator.prototype, 'platform'),
  'Document.prototype.hidden': getter(Document.prototype, 'hidden'),
  'Document.prototype.visibilityState': getter(Document.prototype, 'visibilityState'),
  'console.error': console.error,
  'console.warn': console.warn,
  'navigator.clipboard.writeText': navigator.clipboard?.writeText,
  'navigator.clipboard.readText': navigator.clipboard?.readText
});

const snapshot = (): Record<string, string> => ({
  htmlAttributes: attributes(document.documentElement),
  bodyAttributes: attributes(document.body),
  bodyChildren: describeChildren(document.body),
  headChildren: describeChildren(document.head, 'meta, style:empty'),
  overlayChildren: String(document.querySelector('.cdk-overlay-container')?.children.length ?? 0),
  themeStyles: String(document.querySelectorAll('style[id^="__theme-"]').length),
  adoptedStyleSheets: String(document.adoptedStyleSheets.length),
  animations: String(document.getAnimations().length),
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  scroll: `${window.scrollX},${window.scrollY}`,
  activeElement: document.activeElement?.tagName.toLowerCase() ?? '',
  fullscreen: String(document.fullscreenElement?.tagName ?? ''),
  selection: document.getSelection()?.toString() ?? '',
  localStorage: storage(localStorage),
  sessionStorage: storage(sessionStorage),
  cookie: document.cookie,
  location: location.href,
  historyLength: String(history.length),
  windowName: window.name,
  windowProperties: Object.getOwnPropertyNames(window)
    .filter(name => !libraryGlobals.has(name))
    .sort()
    .join(),
  navigatorOwnProperties: Object.getOwnPropertyNames(navigator).sort().join(),
  title: document.title,
  designMode: document.designMode,
  fakeTimers: String(vi.isFakeTimers()),
  listeners: describeListeners(),
  handlers: handlerProperties(),
  observers: Array.from(tracker.observers)
    .filter(([ref]) => ref.deref())
    .flatMap(([, targets]) => Array.from(targets.values()))
    .sort()
    .join(','),
  intervals: String(tracker.intervals.size),
  longTimeouts: String(tracker.longTimeouts.size)
});

// The setup file runs once per test file in the same window, so state is created only once.
const state = (holder[Symbol.for('@siemens/element-ng/leak-check')] ??= {
  baseline: snapshot(),
  globals: trackedGlobals(),
  seen: new Set(),
  // Real timer so a leaked fake timer cannot hang the hook.
  setTimeout: globalThis.setTimeout.bind(globalThis)
}) as LeakCheckState;

const listKeys =
  /^(windowProperties|navigatorOwnProperties|bodyChildren|headChildren|listeners|handlers|observers)$/;

const describeDiff = (key: string, before: string, after: string): string => {
  // Long lists are reported as added and removed entries instead of two huge strings.
  if (listKeys.test(key)) {
    const previous = new Set(before.split(','));
    const current = new Set(after.split(','));
    const added = [...current].filter(entry => !previous.has(entry));
    const removed = [...previous].filter(entry => !current.has(entry));
    return `${key}: +[${added}] -[${removed}]`;
  }
  return `${key}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`;
};

// The outermost aroundEach, so it checks after every hook, `using` disposal and the TestBed teardown.
aroundEach(async runTest => {
  await runTest();
  if (snapshot().viewport !== state.baseline.viewport) {
    await new Promise(resolve => state.setTimeout(resolve, 100));
  }
  const now = snapshot();
  const diffs = Object.keys(now)
    .filter(key => now[key] !== state.baseline[key])
    .map(key => describeDiff(key, state.baseline[key], now[key]));
  const globals = trackedGlobals();
  diffs.push(
    ...Object.keys(globals)
      .filter(key => globals[key] !== state.globals[key])
      .map(key => `globalReplaced: ${key}`)
  );
  // Each distinct diff is reported once, so a single leak does not fail all following tests.
  const fresh = diffs.filter(diff => !state.seen.has(diff));
  if (fresh.length) {
    fresh.forEach(diff => state.seen.add(diff));
    const timers = [...tracker.intervals.values(), ...tracker.longTimeouts.values()];
    const origins = fresh.some(diff => /^(intervals|longTimeouts)/.test(diff))
      ? ` | timers created at: ${timers.join(' ## ')}`
      : '';
    throw new Error(`LEAK_DIFF ${fresh.join(' | ')}${origins}`);
  }
});
