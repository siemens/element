/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiPopoverDirective } from '@siemens/element-ng/popover';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiPopoverDirective, SiIconNextComponent],
  templateUrl: './si-popover.html'
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
