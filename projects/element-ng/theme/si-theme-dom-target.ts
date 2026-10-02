/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, inject, InjectionToken } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import type { ColorScheme } from './si-theme.model';

/**
 * DOM boundary controlled by {@link SiThemeService}.
 */
export interface SiThemeDomTarget {
  /** Element that receives theme and color-scheme classes. */
  readonly element: HTMLElement;
  /** CSS selector used for runtime theme variables. */
  readonly rootSelector: string;
  /** Event target for the legacy `theme-switch` event. */
  readonly eventTarget?: EventTarget;

  forEachElement(callback: (element: HTMLElement) => void): void;
  registerElement?(element: HTMLElement): () => void;
  getStyleElement(id: string): HTMLStyleElement | null;
  appendStyleElement(style: HTMLStyleElement): void;
  updateColorScheme(colorScheme: ColorScheme): void;
}

/**
 * Theme DOM target. The default implementation targets the current document.
 */
export const SI_THEME_DOM_TARGET = new InjectionToken<SiThemeDomTarget>('SI_THEME_DOM_TARGET', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    const meta = inject(Meta);

    return {
      element: document.documentElement,
      rootSelector: ':root',
      eventTarget: document.defaultView ?? undefined,
      forEachElement: callback => callback(document.documentElement),
      getStyleElement: id => document.getElementById(id) as HTMLStyleElement | null,
      appendStyleElement: style => document.body.append(style),
      updateColorScheme: colorScheme =>
        meta.updateTag({ name: 'color-scheme', content: colorScheme })
    };
  }
});
