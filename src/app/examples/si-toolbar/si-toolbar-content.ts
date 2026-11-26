/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ToolbarWidget } from '@angular/aria/toolbar';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject, signal } from '@angular/core';
import {
  elementCopy,
  elementDelete,
  elementDown2,
  elementExport,
  elementInkPen,
  elementLine,
  elementMove,
  elementRedo,
  elementText,
  elementUndo,
  elementZoomIn,
  elementZoomOut
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuModule } from '@siemens/element-ng/menu';
import {
  SelectItem,
  SiSelectComponent,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';
import { SiToolbarComponent, SiToolbarGroupComponent } from '@siemens/element-ng/toolbar';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    CdkMenuTrigger,
    SiIconComponent,
    SiMenuModule,
    SiSelectComponent,
    SiSelectSimpleOptionsDirective,
    SiSelectSingleValueDirective,
    SiToolbarComponent,
    SiToolbarGroupComponent,
    SiTooltipDirective,
    ToolbarWidget
  ],
  templateUrl: './si-toolbar-content.html',
  host: { class: 'd-flex flex-column align-items-start gap-6 p-6' }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly icons = addIcons({
    elementCopy,
    elementDelete,
    elementDown2,
    elementExport,
    elementInkPen,
    elementLine,
    elementMove,
    elementRedo,
    elementText,
    elementUndo,
    elementZoomIn,
    elementZoomOut
  });

  readonly tools = [
    { id: 'pen', label: 'Pen', icon: this.icons.elementInkPen },
    { id: 'move', label: 'Move', icon: this.icons.elementMove },
    { id: 'line', label: 'Line', icon: this.icons.elementLine },
    { id: 'text', label: 'Text', icon: this.icons.elementText }
  ];
  readonly activeTool = signal('text');

  readonly zoomLevels: SelectItem<number>[] = [50, 75, 100, 150, 200].map(level => ({
    type: 'option',
    value: level,
    label: `${level}%`
  }));
  readonly zoom = signal(100);

  readonly view = signal<'2d' | '3d'>('2d');

  selectTool(tool: string): void {
    this.activeTool.set(tool);
    this.logEvent(`Selected tool: ${tool}`);
  }
}
