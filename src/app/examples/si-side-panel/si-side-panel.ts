/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiAccordionComponent,
  SiCollapsiblePanelComponent
} from '@spike-rabbit/element-ng/accordion';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@spike-rabbit/element-ng/application-header';
import { ElementDimensions } from '@spike-rabbit/element-ng/resize-observer';
import {
  SidePanelMode,
  SidePanelSize,
  SiSidePanelComponent,
  SiSidePanelContentComponent
} from '@spike-rabbit/element-ng/side-panel';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiHeaderBrandDirective,
    RouterLink,
    SiAccordionComponent,
    SiCollapsiblePanelComponent,
    SiApplicationHeaderComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-side-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  collapsed = true;
  mode: SidePanelMode = 'scroll';
  size: SidePanelSize = 'regular';

  logEvent = inject(LOG_EVENT);

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  toggleMode(): void {
    this.mode = this.mode === 'over' ? 'scroll' : 'over';
  }

  changeSize(): void {
    this.size = this.size === 'regular' ? 'wide' : 'regular';
  }

  contentResize(dim: ElementDimensions): void {
    this.logEvent(`content resized: ${dim.width}, ${dim.height}`);
  }
}
