/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';

@Component({
  selector: 'app-sample',
  imports: [SiInlineNotificationComponent],
  templateUrl: './si-inline-notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
