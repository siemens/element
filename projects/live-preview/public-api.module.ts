/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ModuleWithProviders, NgModule } from '@angular/core';
import { REMOVE_STYLES_ON_COMPONENT_DESTROY } from '@angular/platform-browser';

import { SiExampleOverviewComponent } from './components/si-example-overview/si-example-overview.component';
import { SiExampleViewerComponent } from './components/si-example-viewer/si-example-viewer.component';
import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS,
  SiLivePreviewConfig
} from './interfaces/live-preview-config';

@NgModule({
  imports: [SiExampleViewerComponent, SiExampleOverviewComponent],
  exports: [SiExampleOverviewComponent, SiExampleViewerComponent],
  providers: [{ provide: REMOVE_STYLES_ON_COMPONENT_DESTROY, useValue: true }]
})
export class SiLivePreviewModule {
  static forRoot(
    config: SiLivePreviewConfig,
    isMobile = false
  ): ModuleWithProviders<SiLivePreviewModule> {
    return {
      ngModule: SiLivePreviewModule,
      providers: [
        { provide: SI_LIVE_PREVIEW_CONFIG, useValue: config },
        {
          provide: SI_LIVE_PREVIEW_INTERNALS,
          useValue: { isMobile, titleBase: 'Overview - Live Preview' }
        }
      ]
    };
  }
}

export { SiLivePreviewModule as SimplLivePreviewModule };
