/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiInfoPageComponent } from '@siemens/element-ng/info-page';

@Component({
  selector: 'app-sample',
  imports: [SiInfoPageComponent, SiIconComponent],
  templateUrl: './si-info-page-stacked-icon.html'
})
export class SampleComponent {
  face = 'element-state-face-neutral';
}
