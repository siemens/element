/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  templateUrl: './si-menu.html',
  imports: [SiMenuModule, CdkContextMenuTrigger, CdkMenuTrigger]
})
export class SampleComponent {
  isAwesome = true;
  beverage = 'beer';
}
