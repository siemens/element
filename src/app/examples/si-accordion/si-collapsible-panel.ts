/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';

@Component({
  selector: 'app-sample',
  templateUrl: './si-collapsible-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiCollapsiblePanelComponent]
})
export class SampleComponent {}
