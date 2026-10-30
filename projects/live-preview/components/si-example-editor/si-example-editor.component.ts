/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';

import { ExampleRouteController } from '../../services/example-route-controller.service';
import { LivePreviewStateService } from '../../services/live-preview-state.service';
import { SiExampleHeaderComponent } from '../si-example-header/si-example-header.component';
import { SiLivePreviewComponent } from '../si-live-preview/si-live-preview.component';

@Component({
  selector: 'si-example-editor',
  imports: [SiExampleHeaderComponent, SiLivePreviewComponent],
  templateUrl: './si-example-editor.component.html',
  providers: [ExampleRouteController],
  host: {
    '[class.has-tabs]': 'routeController.hasTabs()',
    '[class.has-tabs-mobile]': 'routeController.hasTabsMobile()'
  }
})
export class SiExampleEditorComponent {
  protected readonly state = inject(LivePreviewStateService);
  protected readonly routeController = inject(ExampleRouteController);

  constructor() {
    this.routeController.initialize('editor');
  }
}
