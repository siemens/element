/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { ComponentRef, inject, Injectable, Injector, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Link } from '@siemens/element-ng/link';
import { SiNoTranslateService, SiTranslateService } from '@siemens/element-translate-ng/translate';
import { ReplaySubject, Subject } from 'rxjs';

import { SiToastNotificationDrawerComponent } from './si-toast-notification-drawer/si-toast-notification-drawer.component';
import { SI_TOAST_AUTO_HIDE_DELAY, SiToast, ToastStateName } from './si-toast.model';

@Injectable({ providedIn: 'root' })
export class SiToastNotificationService implements OnDestroy {
  /**
   * List of currently active toasts to see details or close them.
   *
   * @defaultValue []
   */
  activeToasts: SiToast[] = [];

  private activeToastsSubject = new ReplaySubject<SiToast[]>(1);
  private queuedToastSubject = new Subject<SiToast>();
  private readonly maxToasts = 3;

  private componentRef?: ComponentRef<SiToastNotificationDrawerComponent>;
  private overlayRef?: OverlayRef;

  private injector = inject(Injector);
  private overlay = inject(Overlay);

  constructor() {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.queuedToastSubject.subscribe((toast: SiToast) => {
      this.activeToasts.push(toast);
      if (this.activeToasts.length > this.maxToasts) {
        this.hideToastNotification(this.activeToasts[0]);
      }
      this.activeToastsSubject.next(this.activeToasts);
      if (!toast.disableAutoClose && toast.timeout) {
        setTimeout(() => this.hideToastNotification(toast), toast.timeout);
      }
    });

    if (isBrowser) {
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
    state: ToastStateName,
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
    toast.timeout ??= SI_TOAST_AUTO_HIDE_DELAY;
    toast.hidden ??= new Subject();
    toast.close = () => this.hideToastNotification(toast);
    this.queuedToastSubject.next(toast);
    return toast;
  }

  /**
   * Hide a toast notification
   * @param toast - The toast object of the toast to be hidden, can be retrieved from {@link activeToasts} and is returned by {@link queueToastNotification}.
   */
  hideToastNotification(toast?: SiToast): void {
    const hiddenToasts: SiToast[] = [];
    const activeToasts: SiToast[] = [];
    this.activeToasts.forEach(item => {
      if (!toast || item === toast) {
        hiddenToasts.push(item);
      } else {
        activeToasts.push(item);
      }
    });

    this.activeToasts = activeToasts;
    this.activeToastsSubject.next(this.activeToasts);

    hiddenToasts.forEach(item => {
      item.hidden?.next();
      item.hidden?.complete();
    });
  }

  private addToastDrawer(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().end('20px').bottom()
    });
    const portal = new ComponentPortal(
      SiToastNotificationDrawerComponent,
      null,
      this.buildInjector()
    );
    this.componentRef = this.overlayRef.attach(portal);
    this.componentRef.setInput('toasts', this.activeToastsSubject);
  }

  // TODO remove once translation must be defined at application start
  // Notification service is provided in 'root'. If no translation is defined, SiNoTranslateService is not provided
  private buildInjector(): Injector {
    let injector = this.injector;
    if (!injector.get(SiTranslateService, null)) {
      injector = Injector.create({
        providers: [{ provide: SiTranslateService, useClass: SiNoTranslateService, deps: [] }],
        parent: this.injector
      });
    }
    return injector;
  }
}
