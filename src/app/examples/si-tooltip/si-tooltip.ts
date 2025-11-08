/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiTooltipDirective],
  templateUrl: './si-tooltip.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  html = `<span>I am a <strong>bold text</strong> tooltip.</span>`;
}
