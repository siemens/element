/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiMessageLoaderComponent } from '@siemens/element-ng/message-loader';

@Component({
  selector: 'app-sample',
  imports: [SiMessageLoaderComponent],
  template: `<si-message-loader />`
})
export class SampleComponent {}
