/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { MenuItem } from '@siemens/element-ng/common';

@Component({
  selector: 'si-test-widget',
  templateUrl: './test-widget.component.html',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TestWidgetComponent implements WidgetInstance {
  @Input() config!: WidgetConfig;
  /** @defaultValue false */
  @Input() editable = false;
  @ViewChild('headerIconTemplate', { static: true })
  private headerIconTemplate?: TemplateRef<unknown>;

  get headerIcon(): TemplateRef<unknown> | undefined {
    return this.config.payload?.headerIcon ? this.headerIconTemplate : undefined;
  }
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
