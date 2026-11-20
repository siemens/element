/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/// <reference types="node" />
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  angularTemplateProject,
  provideStackblitzConfig,
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS,
  SiLivePreviewConfig
} from '@siemens/live-preview';

declare const livePreviewApplicationUrl: string;

// Only discover alternative framework names. Angular examples are loaded by the iframe app.
const componentLoader: SiLivePreviewConfig['componentLoader'] =
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  require('@siemens/live-preview/component-loader?root=src&examples=app/examples/**/*.{tsx,vue,js}&webcomponents=true!./web-components.config').default;

const applicationUrl = new URL(livePreviewApplicationUrl, import.meta.url);

export const WEB_COMPONENTS_CONFIG: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    {
      provide: SI_LIVE_PREVIEW_CONFIG,
      useValue: {
        applicationUrl: applicationUrl.href,
        componentLoader,
        examplesBaseUrl: 'app/examples/',
        ticketBaseUrl: 'https://github.com/siemens/element/issues/new',
        themeSwitcher: true,
        rtlSwitcher: true,
        webcomponents: true,
        rootFontSizes: [12, 14, 16, 20, 24],
        availableLocales: ['en', 'el', 'de', 'fr']
      } satisfies SiLivePreviewConfig
    },
    {
      provide: SI_LIVE_PREVIEW_INTERNALS,
      useValue: { isMobile: false, titleBase: 'Overview - Live Preview' }
    },
    provideStackblitzConfig({
      templates: [
        { ...angularTemplateProject(), assetUrl: new URL('assets/angular', applicationUrl).href }
      ]
    })
  ]
};
