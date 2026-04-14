/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Provider } from '@angular/core';
import type { Route } from '@angular/router';

import { SI_LIVE_PREVIEW_EXAMPLE_ROUTES } from '../interfaces/live-preview-config';

export const setDeviceMode = (mode: string): void => {
  const htmlTag = document.documentElement;
  htmlTag.setAttribute('mode', mode);
  htmlTag.classList.add(mode);
  htmlTag.classList.remove(mode === 'ios' ? 'md' : 'ios');
};

export const setDirectionRtl = (rtl: boolean): void => {
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
};

export const setRootFontSize = (rfs: number | 'initial'): void => {
  const htmlTag = document.documentElement;
  if (!rfs) {
    htmlTag.style.removeProperty('font-size');
  } else {
    htmlTag.style.setProperty('font-size', rfs === 'initial' ? rfs : rfs + 'px');
  }
};

export const provideExampleRoutes = (routes: Route[]): Provider => {
  return {
    provide: SI_LIVE_PREVIEW_EXAMPLE_ROUTES,
    useValue: routes
  };
};
