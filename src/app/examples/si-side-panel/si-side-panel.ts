/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { ElementDimensions } from '@siemens/element-ng/resize-observer';
import {
  SidePanelMode,
  SidePanelSize,
  SidePanelDisplayMode,
  SidePanelNavigateConfig,
  SiSidePanelComponent,
  SiSidePanelContentComponent
} from '@siemens/element-ng/side-panel';
import { LOG_EVENT } from '@siemens/live-preview';

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
  displayMode: SidePanelDisplayMode = 'overlay';

  // Configurazioni per le nuove modalità
  navigateConfig: SidePanelNavigateConfig = {
    navigateUrl: '/side-panel-dedicated-page',
    target: '_blank'
  };

  logEvent = inject(LOG_EVENT);

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  toggleMode(): void {
    this.mode = this.mode === 'over' ? 'scroll' : 'over';
  }

  changeSize(): void {
    if (this.size === 'regular') {
      this.size = 'wide';
    } else if (this.size === 'wide') {
      this.size = 'extended';
    } else {
      this.size = 'regular';
    }
  }

  contentResize(dim: ElementDimensions): void {
    this.logEvent(`content resized: ${dim.width}, ${dim.height}`);
  }

  onNavigate(url: string): void {
    this.logEvent(`Navigate clicked: ${url}`);
    // window.open(url, this.navigateConfig.target ?? '_self');
  }
}
