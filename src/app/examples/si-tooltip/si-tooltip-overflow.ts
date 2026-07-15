/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiTooltipOverflowDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiTooltipOverflowDirective],
  templateUrl: './si-tooltip-overflow.html'
})
export class SampleComponent {}
