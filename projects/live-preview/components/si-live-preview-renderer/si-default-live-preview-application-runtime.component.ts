/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ViewContainerRef, viewChild } from '@angular/core';

import { SiLivePreviewApplicationRuntimeComponent } from './si-live-preview-application-runtime.component';

/** Default shell that renders an example in an independent Angular application. */
@Component({
  selector: 'si-live-preview-application-runtime',
  template: '<ng-container #container />'
})
export class SiDefaultLivePreviewApplicationRuntimeComponent extends SiLivePreviewApplicationRuntimeComponent {
  readonly container = viewChild.required('container', { read: ViewContainerRef });
}
