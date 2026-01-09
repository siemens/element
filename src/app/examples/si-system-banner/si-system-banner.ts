/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiSystemBannerComponent } from '@siemens/element-ng/system-banner';

@Component({
  selector: 'app-sample',
  imports: [SiSystemBannerComponent],
  templateUrl: './si-system-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
