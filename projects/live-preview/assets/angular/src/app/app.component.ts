/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SampleComponent } from './example.component';

@Component({
  /* eslint-disable @angular-eslint/component-selector */
  selector: 'app-root',
  imports: [SampleComponent],
  template: `<app-sample />`,
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AppComponent {}
