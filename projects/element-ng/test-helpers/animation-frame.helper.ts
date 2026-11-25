/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/**
 * Wait for the browser to complete a full rendering frame so layout updates and
 * native `ResizeObserver` notifications for recent DOM/style changes have been delivered.
 *
 * Each browser rendering frame runs in order:
 * `requestAnimationFrame` callbacks -> Style -> Layout -> `ResizeObserver`
 * (see https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering).
 *
 * A single `requestAnimationFrame` resolves before the layout and `ResizeObserver` steps
 * of its own frame, so waiting for a nested second `requestAnimationFrame` ensures the
 * current frame has completed before the promise settles.
 */
export const waitForAnimationFrame = (): Promise<void> =>
  new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
