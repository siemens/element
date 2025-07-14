/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
// Adds a window listener which can optionally be active, returns the unregister function.
// For some events (e.g. "touchmove") an explicit "passive: false" is required in order to
// be able to do $event.preventDefault(). Unfortunately there is no way in Angular to pass
// options to Rendrer2/EventManager event handling.
export const listenGlobal = (
  eventName: string,
  handler: (e: any) => void,
  active?: boolean
): (() => void) => {
  let opts: any = false;
  if (active !== undefined) {
    opts = { passive: !active };
  }

  window.addEventListener(eventName, handler, opts);
  return () => {
    window.removeEventListener(eventName, handler, opts);
  };
};
