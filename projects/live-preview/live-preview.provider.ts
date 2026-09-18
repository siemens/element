/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ApplicationConfig,
  EnvironmentProviders,
  Injector,
  makeEnvironmentProviders
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { SiDefaultLivePreviewApplicationRuntimeComponent } from './components/si-live-preview-renderer/si-default-live-preview-application-runtime.component';
import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS,
  SiLivePreviewConfig
} from './interfaces/live-preview-config';
import { livePreviewRoutes } from './live-preview-routes';

export interface SiLivePreviewProviderConfig extends SiLivePreviewConfig {
  /**
   * Configuration applied to each isolated example application. A factory can use the host
   * injector to share selected service instances with the example application.
   */
  exampleApplicationConfig?: ApplicationConfig | ((injector: Injector) => ApplicationConfig);
}

/**
 * Configures live preview with each example rendered in an independent Angular application.
 */
export const provideLivePreview = (
  config: SiLivePreviewProviderConfig,
  isMobile = false
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideRouter(livePreviewRoutes, withHashLocation()),
    {
      provide: SI_LIVE_PREVIEW_CONFIG,
      useValue: {
        ...config,
        runtimeComponent: config.runtimeComponent ?? SiDefaultLivePreviewApplicationRuntimeComponent
      }
    },
    {
      provide: SI_LIVE_PREVIEW_INTERNALS,
      useValue: { isMobile, titleBase: 'Overview - Live Preview' }
    }
  ]);
};
