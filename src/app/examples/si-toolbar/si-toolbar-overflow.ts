/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ToolbarWidget } from '@angular/aria/toolbar';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, computed, inject, signal } from '@angular/core';
import {
  elementAlignHorizontalCenters,
  elementAlignLeft,
  elementAlignRight,
  elementAlignVerticalCenters,
  elementInkPen,
  elementLine,
  elementMove,
  elementOptions,
  elementRedo,
  elementText,
  elementUndo,
  elementZoomIn,
  elementZoomOut,
  elementZoomReset
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuModule } from '@siemens/element-ng/menu';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiToolbarComponent, SiToolbarGroupComponent } from '@siemens/element-ng/toolbar';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

interface ToolbarAction {
  id: string;
  label: string;
  icon: string;
}

interface ToolbarSection {
  label: string;
  actions: ToolbarAction[];
}

// Sizes of the toolbar elements in pixels, used to calculate how many actions fit.
const ITEM_SIZE = 32;
const ITEM_GAP = 4;
const GROUP_PADDING = 8;
const GROUP_DIVIDER = 1;

@Component({
  selector: 'app-sample',
  imports: [
    CdkMenuTrigger,
    SiIconComponent,
    SiMenuModule,
    SiResizeObserverDirective,
    SiToolbarComponent,
    SiToolbarGroupComponent,
    SiTooltipDirective,
    ToolbarWidget
  ],
  templateUrl: './si-toolbar-overflow.html',
  host: { class: 'si-layout-fixed-height gap-6 p-6' }
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
    elementOptions,
    elementRedo,
    elementText,
    elementUndo,
    elementZoomIn,
    elementZoomOut,
    elementZoomReset
  });

  /** Sections ordered by importance. Less important actions move into the overflow menus first. */
  readonly sections: ToolbarSection[] = [
    {
      label: 'Tools',
      actions: [
        { id: 'pen', label: 'Pen', icon: this.icons.elementInkPen },
        { id: 'move', label: 'Move', icon: this.icons.elementMove },
        { id: 'line', label: 'Line', icon: this.icons.elementLine },
        { id: 'text', label: 'Text', icon: this.icons.elementText }
      ]
    },
    {
      label: 'History',
      actions: [
        { id: 'undo', label: 'Undo', icon: this.icons.elementUndo },
        { id: 'redo', label: 'Redo', icon: this.icons.elementRedo }
      ]
    },
    {
      label: 'Alignment',
      actions: [
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
      ]
    },
    {
      label: 'Zoom',
      actions: [
        { id: 'zoom-in', label: 'Zoom in', icon: this.icons.elementZoomIn },
        { id: 'zoom-out', label: 'Zoom out', icon: this.icons.elementZoomOut },
        { id: 'zoom-reset', label: 'Reset zoom', icon: this.icons.elementZoomReset }
      ]
    }
  ];

  readonly workspaceWidth = signal(100);
  readonly availableWidth = signal(0);

  /** Splits the actions of each section into the visible ones and the ones in the overflow menu. */
  readonly layout = computed(() => {
    let space = this.availableWidth();
    return this.sections.map((section, index) => {
      space -= GROUP_PADDING + (index > 0 ? GROUP_DIVIDER : 0);
      // Each following section needs at least the space for its overflow button.
      const reserved =
        (this.sections.length - index - 1) * (GROUP_DIVIDER + GROUP_PADDING + ITEM_SIZE);
      const count = section.actions.length;
      const requiredSpace = count * ITEM_SIZE + (count - 1) * ITEM_GAP;
      let visibleCount = count;
      if (requiredSpace > space - reserved) {
        // Keep space for the overflow button.
        visibleCount = Math.max(
          0,
          Math.floor((space - reserved - ITEM_SIZE) / (ITEM_SIZE + ITEM_GAP))
        );
      }
      const itemCount = visibleCount < count ? visibleCount + 1 : count;
      space -= itemCount * ITEM_SIZE + (itemCount - 1) * ITEM_GAP;
      return {
        section,
        visible: section.actions.slice(0, visibleCount),
        overflow: section.actions.slice(visibleCount)
      };
    });
  });

  runAction(action: ToolbarAction): void {
    this.logEvent(action.label);
  }
}
