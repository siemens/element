/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiIconModule } from '@siemens/element-ng/icon';
import {
  SiPopoverNextDirective,
  SiPopoverTitleDirective,
  SiPopoverDescriptionDirective
} from '@siemens/element-ng/popover-next';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-popover-next.html',
  imports: [
    SiIconModule,
    SiPopoverNextDirective,
    SiPopoverTitleDirective,
    SiPopoverDescriptionDirective
  ]
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
