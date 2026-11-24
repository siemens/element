/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ToolbarWidget } from '@angular/aria/toolbar';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  elementAlignHorizontalCenters,
  elementAlignLeft,
  elementAlignRight,
  elementAlignVerticalCenters,
  elementInkPen,
  elementLine,
  elementMove,
  elementRedo,
  elementText,
  elementUndo
} from '@siemens/element-icons';
import {
  SiAccountDetailsComponent,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import {
  SiToolbarAlignment,
  SiToolbarComponent,
  SiToolbarGroupComponent,
  SiToolbarPlacement,
  SiToolbarVariant
} from '@siemens/element-ng/toolbar';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    SiAccountDetailsComponent,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderLogoDirective,
    SiIconComponent,
    SiNavbarVerticalComponent,
    SiToolbarComponent,
    SiToolbarGroupComponent,
    SiTooltipDirective,
    TitleCasePipe,
    ToolbarWidget
  ],
  templateUrl: './si-toolbar.html',
  host: { class: 'si-layout-fixed-height' }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly icons = addIcons({
    elementAlignHorizontalCenters,
    elementAlignLeft,
    elementAlignRight,
    elementAlignVerticalCenters,
    elementInkPen,
    elementLine,
    elementMove,
    elementRedo,
    elementText,
    elementUndo
  });

  readonly tools = [
    { id: 'pen', label: 'Pen', icon: this.icons.elementInkPen },
    { id: 'move', label: 'Move', icon: this.icons.elementMove },
    { id: 'line', label: 'Line', icon: this.icons.elementLine },
    { id: 'text', label: 'Text', icon: this.icons.elementText }
  ];
  readonly alignmentActions = [
    { id: 'align-left', label: 'Align left', icon: this.icons.elementAlignLeft },
    {
      id: 'align-vertical-centers',
      label: 'Align vertical centers',
      icon: this.icons.elementAlignVerticalCenters
    },
    {
      id: 'align-horizontal-centers',
      label: 'Align horizontal centers',
      icon: this.icons.elementAlignHorizontalCenters
    },
    { id: 'align-right', label: 'Align right', icon: this.icons.elementAlignRight }
  ];
  readonly activeTool = signal('move');

  readonly placements: SiToolbarPlacement[] = ['start', 'end', 'top', 'bottom'];
  readonly placement = signal<SiToolbarPlacement>('bottom');
  readonly alignments: SiToolbarAlignment[] = ['start', 'center', 'end'];
  readonly alignment = signal<SiToolbarAlignment>('center');
  readonly orientation = computed(() =>
    this.placement() === 'start' || this.placement() === 'end' ? 'vertical' : 'horizontal'
  );

  readonly variant = signal<SiToolbarVariant>('floating');
  readonly multipleToolbars = signal(false);
  readonly floatingMultiple = computed(
    () => this.variant() === 'floating' && this.multipleToolbars()
  );
  readonly dockToLayout = signal(false);
  readonly dockedToLayout = computed(() => this.variant() === 'docked' && this.dockToLayout());
  readonly navbarItems = computed<NavbarVerticalItem[]>(() => [
    {
      type: 'action',
      label: 'Floating',
      icon: 'element-brush',
      active: this.variant() === 'floating',
      action: () => this.variant.set('floating')
    },
    {
      type: 'action',
      label: 'Docked',
      icon: 'element-document',
      active: this.variant() === 'docked',
      action: () => this.variant.set('docked')
    }
  ]);

  selectTool(tool: string): void {
    this.activeTool.set(tool);
    this.logEvent(`Selected tool: ${tool}`);
  }

  onMultipleToolbarsChange(event: Event): void {
    this.multipleToolbars.set((event.target as HTMLInputElement).checked);
  }

  onDockToLayoutChange(event: Event): void {
    this.dockToLayout.set((event.target as HTMLInputElement).checked);
  }
}
