/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';

@Component({
  selector: 'app-sample',
  imports: [SiCollapsiblePanelComponent],
  templateUrl: './si-collapsible-panel.html'
})
export class SampleComponent {}
