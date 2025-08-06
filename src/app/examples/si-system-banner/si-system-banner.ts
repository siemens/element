/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiSystemBannerComponent } from '@spike-rabbit/element-ng/system-banner';

@Component({
  selector: 'app-sample',
  imports: [SiSystemBannerComponent],
  templateUrl: './si-system-banner.html'
})
export class SampleComponent {}
