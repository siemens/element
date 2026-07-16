/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiTooltipDirective],
  templateUrl: './selection-buttons.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
