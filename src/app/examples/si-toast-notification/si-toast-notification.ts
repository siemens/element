/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Link } from '@spike-rabbit/element-ng/link';
import {
  SiToastNotificationService,
  ToastStateName
} from '@spike-rabbit/element-ng/toast-notification';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-toast-notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  private toastNotificationService = inject(SiToastNotificationService);

  showToast(
    state: ToastStateName,
    title: string,
    message: string,
    disableAutoClose?: boolean,
    disableManualClose?: boolean,
    timeout?: number,
    action?: Link
  ): void {
    const toast = this.toastNotificationService.showToastNotification({
      state,
      title,
      message,
      disableAutoClose,
      disableManualClose,
      timeout: timeout ? (navigator.webdriver ? timeout * 3 : timeout) : undefined,
      action
    });
    toast.hidden?.subscribe(() => this.logEvent('toast hidden'));
  }

  showActionableToast(
    state: ToastStateName,
    title: string,
    message: string,
    linkTitle: string
  ): void {
    this.showToast(state, title, message, undefined, undefined, undefined, {
      title: linkTitle,
      action: () => this.onAction()
    });
  }

  onAction(): void {
    this.logEvent('onAction');
  }

  hideAll(): void {
    this.toastNotificationService.hideToastNotification();
  }
}
