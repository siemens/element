/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/**
 * Opt-in diagnostic: `LEAK_CHECK=1 CI=true pnpm lib:test`.
 * Fails the first test after which shared document state differs from the state at start-up.
 */
import { aroundEach, vi } from 'vitest';

interface LeakCheckState {
  baseline: Record<string, string>;
  globals: Record<string, unknown>;
  bodyChildren: Set<string>;
  seen: Set<string>;
  setTimeout: typeof setTimeout;
}

const attributes = (element: Element): string =>
  Array.from(element.attributes)
    // Restoring a class or style often leaves an empty attribute behind, which is harmless.
    .filter(attr => attr.value !== '')
    .map(attr => `${attr.name}=${attr.value}`)
    .sort()
    .join(' ');

const bodyChildren = (): string[] =>
  Array.from(document.body.children).map(e => e.tagName.toLowerCase() + (e.id ? `#${e.id}` : ''));

// Globals that specs spy on or replace; a changed identity means a spy or mock was not restored.
const trackedGlobals = (): Record<string, unknown> => ({
  Date,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame,
  matchMedia,
  getComputedStyle,
  FileReader,
  ResizeObserver,
  'IntersectionObserver.prototype.observe': IntersectionObserver.prototype.observe,
  'console.error': console.error,
  'console.warn': console.warn,
  'navigator.clipboard.writeText': navigator.clipboard?.writeText,
  'document.addEventListener': document.addEventListener,
  'document.removeEventListener': document.removeEventListener
});

const snapshot = (): Record<string, string> => ({
  htmlAttributes: attributes(document.documentElement),
  bodyAttributes: attributes(document.body),
  overlayChildren: String(document.querySelector('.cdk-overlay-container')?.children.length ?? 0),
  themeStyles: String(document.querySelectorAll('style[id^="__theme-"]').length),
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  scroll: `${window.scrollX},${window.scrollY}`,
  activeElement: document.activeElement?.tagName.toLowerCase() ?? '',
  selection: document.getSelection()?.toString() ?? '',
  localStorage: Object.keys(localStorage).sort().join(),
  sessionStorage: Object.keys(sessionStorage).sort().join(),
  navigatorOwnProperties: Object.getOwnPropertyNames(navigator).sort().join(),
  title: document.title,
  fakeTimers: String(vi.isFakeTimers())
});

// The setup file runs once per test file in the same window, so state is created only once.
const stateHolder = globalThis as Record<symbol, LeakCheckState | undefined>;
const state = (stateHolder[Symbol.for('@siemens/element-ng/leak-check')] ??= {
  baseline: snapshot(),
  globals: trackedGlobals(),
  bodyChildren: new Set(bodyChildren()),
  seen: new Set(),
  setTimeout: globalThis.setTimeout.bind(globalThis)
});

// The outermost aroundEach, so it checks after every hook, `using` disposal and the TestBed teardown.
aroundEach(async runTest => {
  await runTest();
  if (snapshot().viewport !== state.baseline.viewport) {
    // Uses the real timer so a leaked fake timer cannot hang this hook.
    await new Promise(resolve => state.setTimeout(resolve, 100));
  }
  const now = snapshot();
  const diffs = Object.keys(now)
    .filter(key => now[key] !== state.baseline[key])
    .map(key => `${key}: ${JSON.stringify(state.baseline[key])} -> ${JSON.stringify(now[key])}`);
  const globals = trackedGlobals();
  diffs.push(
    ...Object.keys(globals)
      .filter(key => globals[key] !== state.globals[key])
      .map(key => `globalReplaced: ${key}`)
  );
  // Report every added body child once, so a leaked element does not fail all following tests.
  diffs.push(
    ...bodyChildren()
      .filter(child => !state.bodyChildren.has(child))
      .map(child => `bodyChildAdded: ${child.replace(/\d+$/, 'N')}`)
  );
  bodyChildren().forEach(child => state.bodyChildren.add(child));
  const fresh = diffs.filter(diff => !state.seen.has(diff));
  if (fresh.length) {
    fresh.forEach(diff => state.seen.add(diff));
    throw new Error(`LEAK_DIFF ${fresh.join(' | ')}`);
  }
});
