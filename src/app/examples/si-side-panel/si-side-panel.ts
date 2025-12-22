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
  SiHeaderLogoDirective,
  SiHeaderActionsDirective,
  SiHeaderActionItemComponent
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
    SiHeaderLogoDirective,
    SiHeaderActionsDirective,
    SiHeaderActionItemComponent
  ],
  templateUrl: './si-side-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  collapsed = true;
  mode: SidePanelMode = 'over';
  size: SidePanelSize = 'regular';
  displayMode: SidePanelDisplayMode = 'overlay';
  disableBackdrop = false;

  navigateConfig: SidePanelNavigateConfig = {
    type: 'link',
    label: 'Side panel link',
    target: '_self',
    href: 'https://element.siemens.io'
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
}
