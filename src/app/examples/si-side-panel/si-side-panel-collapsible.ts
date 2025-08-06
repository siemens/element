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
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@spike-rabbit/element-ng/application-header';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { ElementDimensions } from '@spike-rabbit/element-ng/resize-observer';
import {
  SidePanelMode,
  SidePanelSize,
  SiSidePanelComponent,
  SiSidePanelContentComponent,
  SiSidePanelService,
  StatusItem
} from '@spike-rabbit/element-ng/side-panel';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    PortalModule,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiAccordionComponent,
    SiApplicationHeaderComponent,
    RouterLink,
    SiHeaderActionItemComponent,
    SiCollapsiblePanelComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-side-panel-collapsible.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnDestroy {
  mode: SidePanelMode = 'scroll';
  size: SidePanelSize = 'regular';
  showHelpAction = false;
  showLayout = false;

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
  statusActions: StatusItem[] = [
    {
      title: 'Out of Service',
      tooltip: 'Out of Service',
      icon: 'element-out-of-service status-warning',
      action: () => this.logEvent('Out of Service')
    },
    {
      title: 'System Operator',
      tooltip: 'System Operator',
      icon: 'element-manual-filled status-warning',
      disabled: true,
      action: () => this.logEvent('System Operator')
    },
    {
      title: 'Event source\nactive, ack',
      tooltip: 'Event source',
      icon: 'element-alarm-background-filled status-danger',
      overlayIcon: 'element-alarm-tick text-body',
      action: () => this.logEvent('Event source, active, ack')
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
    this.size = this.size === 'regular' ? 'wide' : 'regular';
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
