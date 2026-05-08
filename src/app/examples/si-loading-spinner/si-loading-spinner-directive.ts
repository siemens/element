/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiLoadingSpinnerDirective, FormsModule],
  templateUrl: './si-loading-spinner-directive.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  loading = false;
  withLoadingText = false;
}
