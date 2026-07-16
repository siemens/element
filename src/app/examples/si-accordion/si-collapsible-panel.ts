/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';

@Component({
  selector: 'app-sample',
  imports: [SiCollapsiblePanelComponent, SiTabComponent, SiTabsetComponent],
  templateUrl: './si-collapsible-panel.html'
})
export class SampleComponent {}
