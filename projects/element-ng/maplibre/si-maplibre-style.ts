/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { assertInInjectionContext, computed, Signal } from '@angular/core';
import { injectIsDarkTheme } from '@siemens/element-ng/theme';
import { siMapStyle } from '@siemens/map-styles/common';
import type { StyleSpecification } from 'maplibre-gl';

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
