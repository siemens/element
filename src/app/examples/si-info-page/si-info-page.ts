/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiInfoPageComponent } from '@siemens/element-ng/info-page';

@Component({
  selector: 'app-sample',
  imports: [SiInfoPageComponent],
  templateUrl: './si-info-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
