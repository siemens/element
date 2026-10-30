/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';

import { ExampleRouteController } from '../../services/example-route-controller.service';
import { LivePreviewStateService } from '../../services/live-preview-state.service';
import { SiExampleHeaderComponent } from '../si-example-header/si-example-header.component';
import { SiLivePreviewRendererComponent } from '../si-live-preview-renderer/si-live-preview-renderer.component';

@Component({
  selector: 'si-example-viewer',
  imports: [SiExampleHeaderComponent, SiLivePreviewRendererComponent],
  templateUrl: './si-example-viewer.component.html',
  styleUrl: './si-example-viewer.component.scss',
  providers: [ExampleRouteController],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.has-tabs]': 'routeController.hasTabs()',
    '[class.has-tabs-mobile]': 'routeController.hasTabsMobile()'
  }
})
export class SiExampleViewerComponent {
  protected readonly state = inject(LivePreviewStateService);
  protected readonly routeController = inject(ExampleRouteController);
  private readonly renderer = viewChild(SiLivePreviewRendererComponent);

  constructor() {
    this.routeController.initialize('viewer', () => this.renderer()?.recompile());
  }
}
