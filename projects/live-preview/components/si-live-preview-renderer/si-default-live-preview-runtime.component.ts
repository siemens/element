/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ViewContainerRef, viewChild } from '@angular/core';

import { SiLivePreviewRuntimeComponent } from './si-live-preview-runtime.component';

/** Default standalone shell used to render a live-preview example. */
@Component({
  selector: 'si-live-preview-runtime',
  template: '<ng-container #container />'
})
export class SiDefaultLivePreviewRuntimeComponent extends SiLivePreviewRuntimeComponent {
  readonly container = viewChild.required('container', { read: ViewContainerRef });
}
