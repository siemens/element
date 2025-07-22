/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiAboutComponent } from '@siemens/element-ng/about';
import { provideCopyrightDetails } from '@siemens/element-ng/copyright-notice';

@Component({
  selector: 'app-sample',
  imports: [SiAboutComponent],
  templateUrl: './si-about-api.html',
  providers: [
    provideCopyrightDetails({
      company: 'Sample Company',
      startYear: 2016,
      lastUpdateYear: 2021
    })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
