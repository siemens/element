/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';

@Component({
  selector: 'app-sample',
  templateUrl: './si-inline-notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiInlineNotificationComponent]
})
export class SampleComponent {}
