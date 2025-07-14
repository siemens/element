/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';
import { Route } from '@angular/router';

export interface SiLivePreviewConfig {
  modules: any[];
  errorHandler?: (err: any) => void;
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
