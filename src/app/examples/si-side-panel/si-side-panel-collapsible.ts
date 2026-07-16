/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Component, inject, OnDestroy, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiApplicationHeaderComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { Link } from '@siemens/element-ng/link';
import { MenuItem } from '@siemens/element-ng/menu';
import { ElementDimensions } from '@siemens/element-ng/resize-observer';
import {
  SidePanelMode,
  SidePanelSize,
  SidePanelDisplayMode,
  SidePanelNavigateConfig,
  SiSidePanelComponent,
  SiSidePanelContentComponent,
  SiSidePanelService,
  SiSidePanelActionsComponent,
  SiSidePanelActionComponent
} from '@siemens/element-ng/side-panel';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    PortalModule,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiSidePanelActionsComponent,
    SiSidePanelActionComponent,
    SiAccordionComponent,
    SiApplicationHeaderComponent,
    RouterLink,
    SiHeaderActionItemComponent,
    SiCollapsiblePanelComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-side-panel-collapsible.html'
})
export class SampleComponent implements OnDestroy {
  mode: SidePanelMode = 'over';
  size: SidePanelSize = 'regular';
  displayMode: SidePanelDisplayMode = 'overlay';
  showHelpAction = false;
  showLayout = false;

  routerLink: Link = { title: 'Side panel router link', 'link': '/' };

  navigateConfig: SidePanelNavigateConfig = {
    type: 'router-link',
    label: this.routerLink.title!,
    routerLink: this.routerLink.link!
  };

  primaryActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Path',
      icon: 'element-object-path',
      iconOnly: true,
      action: () => this.logEvent('path')
    },
    {
      type: 'action',
      label: 'Edit',
      icon: 'element-notes-edit',
      iconOnly: true,
      iconBadge: true,
      action: () => this.logEvent('edit')
    }
  ];
  secondaryActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Some other action',
      action: () => this.logEvent('yes, you clicked it')
    }
  ];

  readonly helpPanel = viewChild.required('helpPanel', { read: CdkPortal });
  readonly layoutPanel = viewChild.required('layoutPanel', { read: CdkPortal });

  logEvent = inject(LOG_EVENT);

  private sidePanelService = inject(SiSidePanelService);

  ngOnDestroy(): void {
    this.sidePanelService.hideTemporaryContent();
  }

  toggle(): void {
    this.sidePanelService.toggle();
  }

  close(): void {
    this.sidePanelService.close();
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

  showHideHelp(): void {
    if (this.hideHelp()) {
      return;
    }
    this.showHelpAction = true;
    this.sidePanelService.showTemporaryContent(this.helpPanel()).subscribe(() => this.hideHelp());
  }

  private hideHelp(): boolean {
    if (this.showHelpAction) {
      this.showHelpAction = false;
      this.sidePanelService.hideTemporaryContent();
      return true;
    }
    return false;
  }

  showHideLayout(): void {
    if (this.hideLayout()) {
      return;
    }
    this.showLayout = true;
    this.sidePanelService
      .showTemporaryContent(this.layoutPanel())
      .subscribe(() => this.hideLayout());
  }

  private hideLayout(): boolean {
    if (this.showLayout) {
      this.showLayout = false;
      this.sidePanelService.hideTemporaryContent();
      return true;
    }
    return false;
  }
}
