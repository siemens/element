/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiAboutComponent } from '@spike-rabbit/element-ng/about';

@Component({
  selector: 'app-sample',
  imports: [SiAboutComponent],
  templateUrl: './si-about-api.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
