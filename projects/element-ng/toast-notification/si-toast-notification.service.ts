/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  ComponentRef,
  inject,
  Injectable,
  Injector,
  inputBinding,
  OnDestroy,
  outputBinding,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isRTL, StatusType } from '@siemens/element-ng/common';
import { Link } from '@siemens/element-ng/link';
import { SiNoTranslateService, SiTranslateService } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';

import { SiToastNotificationDrawerComponent } from './si-toast-notification-drawer/si-toast-notification-drawer.component';
import { SI_TOAST_AUTO_HIDE_DELAY, SiToast } from './si-toast.model';

@Injectable({ providedIn: 'root' })
export class SiToastNotificationService implements OnDestroy {
  private readonly activeToastsSignal = signal<SiToast[]>([]);

  /** List of currently active toasts to see details or close them.  */
  get activeToasts(): SiToast[] {
    return this.activeToastsSignal();
  }

  private readonly maxToasts = 3;

  private componentRef?: ComponentRef<SiToastNotificationDrawerComponent>;
  private overlayRef?: OverlayRef;

  private injector = inject(Injector);
  private overlay = inject(Overlay);
  private toastTimeoutMap = new Map<SiToast, any>();
  private toastTimerDefaults = new Map<
    SiToast,
    { pendingTimeout: number; initializeTime: number }
  >();

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.addToastDrawer();
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
    this.componentRef?.destroy();
  }

  /**
   * Queue a new toast to be shown.
   * @param action - Passing a Link object will optionally add a clickable link to the toast which can contain an action.
   * @returns the toast object
   */
  queueToastNotification(
    state: StatusType,
    title: string,
    message: string,
    disableAutoClose?: boolean,
    disableManualClose?: boolean,
    action?: Link
  ): SiToast {
    const toast: SiToast = {
      state,
      title,
      message,
      disableAutoClose,
      disableManualClose,
      action,
      hidden: new Subject()
    };
    return this.showToastNotification(toast);
  }

  /**
   * Show a toast notification
   * @param toast - The toast object of the toast to be shown, can also be constructed while calling this.
   */
  showToastNotification(toast: SiToast): SiToast {
    this.overlayRef?.setDirection(isRTL() ? 'rtl' : 'ltr');
    toast.timeout ??= SI_TOAST_AUTO_HIDE_DELAY;
    toast.hidden ??= new Subject();
    toast.close = () => this.hideToastNotification(toast);

    const toasts = this.activeToastsSignal().concat(toast);
    this.activeToastsSignal.set(toasts);
    if (toasts.length > this.maxToasts) {
      this.hideToastNotification(toasts[0]);
    }
    if (!toast.disableAutoClose && toast.timeout) {
      this.toastTimerDefaults.set(toast, {
        pendingTimeout: toast.timeout,
        initializeTime: Date.now()
      });
      this.toastTimeoutMap.set(
        toast,
        setTimeout(() => this.hideToastNotification(toast), toast.timeout)
      );
    }

    return toast;
  }

  /**
   * Hide a toast notification
   * @param toast - The toast object of the toast to be hidden, can be retrieved from {@link activeToasts} and is returned by {@link queueToastNotification}.
   */
  hideToastNotification(toast?: SiToast): void {
    const hiddenToasts: SiToast[] = [];
    const activeToasts: SiToast[] = [];
    this.activeToastsSignal().forEach(item => {
      if (!toast || item === toast) {
        hiddenToasts.push(item);
      } else {
        activeToasts.push(item);
      }
    });

    this.activeToastsSignal.set(activeToasts);

    hiddenToasts.forEach(item => {
      item.hidden?.next();
      item.hidden?.complete();
      this.toastTimerDefaults.delete(item);
      this.toastTimeoutMap.delete(item);
    });
  }

  private pauseToastNotification(toast: SiToast): void {
    if (!toast.disableAutoClose) {
      clearTimeout(this.toastTimeoutMap.get(toast));

      const initialTimeout = this.toastTimerDefaults.get(toast)?.initializeTime;
      const elapsedTime = initialTimeout ? Date.now() - initialTimeout : 0;
      this.toastTimerDefaults.get(toast)!.pendingTimeout -= elapsedTime;
    }
  }

  private resumeToastNotification(toast: SiToast): void {
    if (!toast.disableAutoClose) {
      this.toastTimerDefaults.get(toast)!.initializeTime = Date.now();
      this.toastTimeoutMap.set(
        toast,
        setTimeout(() => {
          this.hideToastNotification(toast);
        }, this.toastTimerDefaults.get(toast)!.pendingTimeout)
      );
    }
  }

  private addToastDrawer(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().end().bottom()
    });
    const portal = new ComponentPortal(
      SiToastNotificationDrawerComponent,
      null,
      this.buildInjector(),
      undefined,
      [
        inputBinding('toasts', this.activeToastsSignal),
        outputBinding('toastPaused', (toast: SiToast) => this.pauseToastNotification(toast)),
        outputBinding('toastResumed', (toast: SiToast) => this.resumeToastNotification(toast))
      ]
    );
    this.componentRef = this.overlayRef.attach(portal);
  }

  private buildInjector(): Injector {
    if (this.injector.get(SiTranslateService, null)) {
      return this.injector;
    }
    // TODO remove once translation must be defined at application start
    // Notification service is provided in 'root'. If no translation is defined, SiNoTranslateService is not provided
    return Injector.create({
      providers: [{ provide: SiTranslateService, useClass: SiNoTranslateService, deps: [] }],
      parent: this.injector
    });
  }
}
