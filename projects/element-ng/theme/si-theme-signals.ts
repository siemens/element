/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map } from 'rxjs';

/**
 * Returns a signal that reflects whether the current Element theme is dark (`true`) or light
 * (`false`). The signal reacts to `theme-switch` events dispatched on `window`.
 *
 * @experimental
 * @returns A boolean signal — `true` when the active theme is dark
 * @throws When called outside of an Angular injection context
 */
export const injectIsDarkTheme = (): Signal<boolean> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return signal(false);
  }

  return toSignal(
    fromEvent<CustomEvent<{ dark: boolean }>>(window, 'theme-switch').pipe(map(e => e.detail.dark)),
    {
      initialValue: document.documentElement.classList.contains('app--dark')
    }
  );
};
