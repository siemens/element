/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
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
import {
  SidePanelMode,
  SidePanelSize,
  SiSidePanelComponent,
  SiSidePanelContentComponent,
  SiSidePanelService
} from '@spike-rabbit/element-ng/side-panel';

@Component({
  selector: 'app-sample',
  imports: [
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiCollapsiblePanelComponent,
    SiAccordionComponent,
    PortalModule,
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-side-panel-portal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnDestroy {
  mode: SidePanelMode = 'scroll';
  size: SidePanelSize = 'regular';

  readonly content1 = viewChild.required('content1', { read: CdkPortal });
  readonly content2 = viewChild.required('content2', { read: CdkPortal });

  private sidePanelService = inject(SiSidePanelService);

  ngOnDestroy(): void {
    this.sidePanelService.setSidePanelContent(undefined);
  }

  toggleMode(): void {
    this.mode = this.mode === 'over' ? 'scroll' : 'over';
  }

  changeSize(): void {
    this.size = this.size === 'regular' ? 'wide' : 'regular';
  }

  toggle(): void {
    this.sidePanelService.toggle();
  }

  setContent1(): void {
    this.sidePanelService.setSidePanelContent(this.content1());
    this.sidePanelService.open();
  }

  setContent2(): void {
    this.sidePanelService.setSidePanelContent(this.content2());
    this.sidePanelService.open();
  }
}
