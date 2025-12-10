/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiMenuModule, CdkContextMenuTrigger, CdkMenuTrigger],
  templateUrl: './si-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  isAwesome = true;
  beverage = 'beer';
}
