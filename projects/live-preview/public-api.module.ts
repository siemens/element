/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { REMOVE_STYLES_ON_COMPONENT_DESTROY } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { SiExampleOverviewComponent } from './components/si-example-overview/si-example-overview.component';
import { SiExampleViewerComponent } from './components/si-example-viewer/si-example-viewer.component';
import { SiLivePreviewIframeComponent } from './components/si-live-preview-iframe/si-live-preview-iframe.component';
import { SiLivePreviewQrComponent } from './components/si-live-preview-qr/si-live-preview-qr.component';
import { SiLivePreviewRendererComponent } from './components/si-live-preview-renderer/si-live-preview-renderer.component';
import { SiLivePreviewWrapperComponent } from './components/si-live-preview-wrapper/si-live-preview-wrapper.component';
import { SiLivePreviewComponent } from './components/si-live-preview/si-live-preview.component';
import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS,
  SiLivePreviewConfig
} from './interfaces/live-preview-config';

@NgModule({
  declarations: [
    SiExampleOverviewComponent,
    SiExampleViewerComponent,
    SiLivePreviewComponent,
    SiLivePreviewIframeComponent,
    SiLivePreviewQrComponent,
    SiLivePreviewRendererComponent,
    SiLivePreviewWrapperComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
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
