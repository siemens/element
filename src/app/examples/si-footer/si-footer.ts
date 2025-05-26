/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiFooterComponent } from '@siemens/element-ng/footer';

@Component({
  selector: 'app-sample',
  templateUrl: './si-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiFooterComponent]
})
export class SampleComponent {}
