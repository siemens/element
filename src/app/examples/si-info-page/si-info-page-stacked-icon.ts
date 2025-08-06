/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { SiInfoPageComponent } from '@spike-rabbit/element-ng/info-page';

@Component({
  selector: 'app-sample',
  imports: [SiInfoPageComponent, SiIconNextComponent],
  templateUrl: './si-info-page-stacked-icon.html'
})
export class SampleComponent {
  face = 'element-state-face-neutral';
}
