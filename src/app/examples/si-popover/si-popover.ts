/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

import {
  SiPopoverDirective,
  SiPopoverTitleDirective,
  SiPopoverBodyDirective
} from '../../../../projects/element-ng/popover';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiPopoverDirective, SiPopoverTitleDirective, SiPopoverBodyDirective],
  templateUrl: './si-popover.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  myContext = {
    $implicit: {
      state: 'powered on',
      duration: '5 minutes',
      power: '1000 W',
      icon: 'element-microwave-on'
    }
  };
}
