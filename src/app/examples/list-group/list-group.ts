/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCircleStatusModule } from '@siemens/element-ng/circle-status';

@Component({
  selector: 'app-sample',
  imports: [SiCircleStatusModule],
  templateUrl: './list-group.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
