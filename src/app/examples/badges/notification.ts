/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { elementAlarmFilled } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent],
  templateUrl: './notification.html',
  host: {
    class: 'p-5 background-1'
  }
})
export class SampleComponent {
  readonly icons = addIcons({ elementAlarmFilled });
}
