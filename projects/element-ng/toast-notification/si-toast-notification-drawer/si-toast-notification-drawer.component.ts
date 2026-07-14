/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output } from '@angular/core';
import { areAnimationsDisabled } from '@siemens/element-ng/common';

import { SiToastNotificationComponent } from '../si-toast-notification/si-toast-notification.component';
import { SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification-drawer',
  imports: [SiToastNotificationComponent],
  templateUrl: './si-toast-notification-drawer.component.html',
  styleUrl: './si-toast-notification-drawer.component.scss',
  host: {
    'aria-live': 'polite',
    '[class.animations-disabled]': 'animationsDisabled'
  }
})
export class SiToastNotificationDrawerComponent {
  readonly toasts = input.required<SiToast[]>();
  readonly toastPaused = output<SiToast>();
  readonly toastResumed = output<SiToast>();

  protected animationsDisabled = areAnimationsDisabled();
}
