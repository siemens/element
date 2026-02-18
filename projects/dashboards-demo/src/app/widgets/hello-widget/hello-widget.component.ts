/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';

@Component({
  selector: 'app-hello-widget',
  templateUrl: './hello-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloWidgetComponent implements WidgetInstance {
  readonly config = input.required<WidgetConfig>();
  primaryEditActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Custom Action',
      icon: 'element-airquality-good',
      action: () => alert('Widget specific edit action.')
    }
  ];
}
