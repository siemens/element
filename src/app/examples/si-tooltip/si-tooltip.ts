/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiIconModule } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiIconModule, SiTooltipDirective],
  templateUrl: './si-tooltip.html'
})
export class SampleComponent {
  html = `<span>I am a <strong>bold text</strong> tooltip.</span>`;
}
