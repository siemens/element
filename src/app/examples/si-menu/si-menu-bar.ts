/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  templateUrl: './si-menu-bar.html',
  imports: [SiMenuModule, CdkMenuTrigger]
})
export class SampleComponent {
  isAwesome = true;
  beverage = 'beer';
}
