/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { areAnimationsDisabled } from '@siemens/element-ng/common';
import { Observable } from 'rxjs';

import { SiToastNotificationComponent } from '../si-toast-notification/si-toast-notification.component';
import { SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification-drawer',
  imports: [AsyncPipe, SiToastNotificationComponent],
  templateUrl: './si-toast-notification-drawer.component.html',
  styleUrl: './si-toast-notification-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-live': 'polite',
    '[class.animations-disabled]': 'animationsDisabled'
  }
})
export class SiToastNotificationDrawerComponent {
  readonly toasts = input<Observable<SiToast[]>>();
  readonly paused = output<SiToast>();
  readonly resumed = output<SiToast>();

  protected animationsDisabled = areAnimationsDisabled();
}
