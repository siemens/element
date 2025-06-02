/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { areAnimationsDisabled } from '@siemens/element-ng/common';
import { Observable } from 'rxjs';

import { SiToastNotificationComponent } from '../si-toast-notification/si-toast-notification.component';
import { SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './si-toast-notification-drawer.component.html',
  animations: [
    trigger('toastTrigger', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100%)' }),
        animate(
          '500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ opacity: 1, transform: 'translateY(0%)' })
        )
      ]),
      transition(':leave', [
        style({ 'opacity': 1, 'inset-inline-end': '0%' }),
        animate('300ms', style({ 'opacity': 0, 'inset-inline-end': '-100%' }))
      ])
    ])
  ],
  imports: [AsyncPipe, SiToastNotificationComponent],
  host: {
    'aria-live': 'polite'
  },
  // workaround for cdk-overlay not supporting the order of overlays
  styles: `
    ::ng-deep .cdk-global-overlay-wrapper:has(si-toast-notification-drawer) {
      z-index: 2000;
    }
  `
})
export class SiToastNotificationDrawerComponent {
  readonly toasts = input<Observable<SiToast[]>>();

  protected animationsDisabled = areAnimationsDisabled();
}
