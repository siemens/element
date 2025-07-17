/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { WidgetConfig, WidgetConfigEvent, WidgetInstance } from '@siemens/dashboards-ng';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-note-widget',
  templateUrl: './note-widget.component.html'
})
export class NoteWidgetComponent implements WidgetInstance, OnInit {
  @Input() config!: WidgetConfig;
  @Input() editable = false;

  primaryActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'User',
      icon: 'element-user',
      action: () => alert('Custom primary action.')
    }
  ];
  secondaryActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Greenleaf',
      icon: 'element-greenleaf',
      action: () => alert('Custom secondary action.')
    }
  ];
  primaryEditActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Custom Action',
      icon: 'element-airquality-good',
      action: () => alert('Widget specific edit action.')
    }
  ];
  secondaryEditActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Light',
      icon: 'element-light-ceiling',
      action: () => alert('Widget specific secondary edit action.')
    }
  ];

  readonly configChange = new EventEmitter<WidgetConfigEvent>();

  ngOnInit(): void {
    this.configChange.emit({
      primaryActions: this.primaryActions,
      secondaryActions: this.secondaryActions,
      primaryEditActions: this.primaryEditActions,
      secondaryEditActions: this.secondaryEditActions
    });
  }
}
