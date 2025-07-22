/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  provideCopyrightDetails,
  SiCopyrightNoticeComponent
} from '@siemens/element-ng/copyright-notice';

@Component({
  selector: 'app-sample',
  imports: [SiCopyrightNoticeComponent],
  templateUrl: './si-copyright-notice.html',
  providers: [
    provideCopyrightDetails({
      startYear: 2023,
      lastUpdateYear: 2025,
      company: 'My Company'
    })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
