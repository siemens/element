/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, Input } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { MenuItem } from '@siemens/element-ng/common';

@Component({
  selector: 'si-test-widget',
  templateUrl: './test-widget.component.html'
})
export class TestWidgetComponent implements WidgetInstance {
  @Input() config!: WidgetConfig;
  /** @defaultValue false */
  @Input() editable = false;
  /**
   * @defaultValue
   * ```
   * [
   *   {
   *     title: 'Hello User',
   *     icon: 'element-user',
   *     action: () => alert('Widget specific edit action.')
   *   }
   * ]
   * ```
   */
  primaryEditActions: MenuItem[] = [
    {
      title: 'Hello User',
      icon: 'element-user',
      action: () => alert('Widget specific edit action.')
    }
  ];
}
