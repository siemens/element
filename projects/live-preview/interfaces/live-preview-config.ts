/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Type } from '@angular/core';
import { Route } from '@angular/router';

import type { SiLivePreviewRuntimeComponent } from '../components/si-live-preview-renderer/si-live-preview-runtime.component';

export interface SiLivePreviewConfig {
  errorHandler?: (err: any) => void;
  /**
   * Optional shell for rendered examples. The shell receives the standalone example through
   * `component` and is responsible for rendering it, for example by composing the default shell.
   */
  runtimeComponent?: Type<SiLivePreviewRuntimeComponent>;
  /**
   * Routes used by rendered examples that do not provide routes through `provideExampleRoutes`.
   */
  defaultRoutes?: Route[];
  componentLoader: {
    load: (name: string) => Promise<any>;
    list: string[];
    webcomponentsList: string[];
  };
  examplesBaseUrl: string;
  ticketBaseUrl: string;
  themeSwitcher?: boolean;
  rtlSwitcher?: boolean;
  landscapeToggle?: boolean;
  webcomponents?: boolean;
  rootFontSizes?: number[];
  /** Maximum number of log messages to retain. */
  maxLogMessages?: number;
}

export interface SiLivePreviewInternals {
  isMobile: boolean;
  titleBase: string;
}

export const SI_LIVE_PREVIEW_CONFIG = new InjectionToken<SiLivePreviewConfig>(
  'SI_LIVE_PREVIEW_CONFIG'
);
export const SI_LIVE_PREVIEW_INTERNALS = new InjectionToken<SiLivePreviewInternals>(
  'SI_LIVE_PREVIEW_INTERNALS'
);
export const SI_LIVE_PREVIEW_EXAMPLE_ROUTES = new InjectionToken<Route[]>(
  'SI_LIVE_PREVIEW_EXAMPLE_ROUTES'
);
