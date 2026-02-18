/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective,
  SiHeaderActionsDirective,
  SiHeaderActionItemComponent
} from '@siemens/element-ng/application-header';
import { SiFormItemComponent } from '@siemens/element-ng/form';
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
    SiFormItemComponent,
    FormsModule,
    SiHeaderActionsDirective,
    SiHeaderActionItemComponent
  ],
  templateUrl: './si-side-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  readonly collapsed = signal(true);
  readonly mode = signal<SidePanelMode>('over');
  readonly size = signal<SidePanelSize>('regular');
  readonly displayMode = signal<SidePanelDisplayMode>('overlay');
  readonly disableBackdrop = signal(false);

  navigateConfig: SidePanelNavigateConfig = {
    type: 'link',
    label: 'Side panel link',
    target: '_self',
    href: 'https://element.siemens.io'
  };

  logEvent = inject(LOG_EVENT);

  toggle(): void {
    this.collapsed.update(value => !value);
  }

  contentResize(dim: ElementDimensions): void {
    this.logEvent(`content resized: ${dim.width}, ${dim.height}`);
  }
}
