/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';

@Component({
  selector: 'app-sample',
  imports: [SiCollapsiblePanelComponent],
  templateUrl: './si-collapsible-panel-icons.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
