/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { areAnimationsDisabled } from '@siemens/element-ng/common';

import { SiToastNotificationComponent } from '../si-toast-notification/si-toast-notification.component';
import { SI_TOAST_TOKEN } from '../si-toast-token.model';

@Component({
  selector: 'si-toast-notification-drawer',
  imports: [SiToastNotificationComponent],
  templateUrl: './si-toast-notification-drawer.component.html',
  styleUrl: './si-toast-notification-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-live': 'polite',
    '[class.animations-disabled]': 'animationsDisabled'
  }
})
export class SiToastNotificationDrawerComponent {
  protected readonly token = inject(SI_TOAST_TOKEN);
  protected animationsDisabled = areAnimationsDisabled();
}
