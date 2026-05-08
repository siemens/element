/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import {
  assertInInjectionContext,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  Signal,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { siMapStyle } from '@siemens/map-styles/common';
import type { StyleSpecification } from 'maplibre-gl';
import { fromEvent, map } from 'rxjs';

/**
 * Creates a signal that returns a {@link StyleSpecification} for MapLibre GL based on the current
 * Element theme. The signal automatically updates when the theme switches between light and dark.
 *
 * @remarks
 * **Must be called in an Angular injection context** (e.g. inside a constructor, field initializer,
 * or a function called from one). Calling this function outside of an injection context will throw
 * an `assertInInjectionContext` error.
 *
 * @experimental
 *
 * @param key - The MapTiler API key used to fetch tiles, glyphs, and sprites
 * @returns A signal that provides the current {@link StyleSpecification} based on the active theme
 * @throws When called outside of an Angular injection context
 */
export const injectSiMapStyle = (key: string): Signal<StyleSpecification> => {
  assertInInjectionContext(injectSiMapStyle);
  const isDark = injectIsDarkTheme();

  return computed(() => {
    return siMapStyle(key, isDark()) as StyleSpecification;
  });
};

/**
 * Returns a signal that reflects whether the current Element theme is dark (`true`) or light
 * (`false`). The signal reacts to `theme-switch` events dispatched on `window`.
 *
 * @experimental
 *
 * @param destroyRef - Optional {@link DestroyRef} used to unsubscribe from the theme event.
 *   When omitted the function obtains one via `inject()`.
 * @returns A boolean signal — `true` when the active theme is dark
 * @throws When called outside of an Angular injection context
 */
export const injectIsDarkTheme = (destroyRef?: DestroyRef): Signal<boolean> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return signal(false);
  }

  destroyRef ??= inject(DestroyRef);
  const isDark = signal(document.documentElement.classList.contains('app--dark'));
  fromEvent<CustomEvent<{ dark: boolean }>>(window, 'theme-switch')
    .pipe(
      takeUntilDestroyed(destroyRef),
      map(e => e.detail.dark)
    )
    .subscribe(dark => isDark.set(dark));
  return isDark;
};
