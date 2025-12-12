/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

import { SampleComponent } from './example.component';

@Component({
  /* eslint-disable @angular-eslint/component-selector */
  selector: 'app-root',
  imports: [SampleComponent],
  template: `<app-sample />`
})
export class AppComponent {}
