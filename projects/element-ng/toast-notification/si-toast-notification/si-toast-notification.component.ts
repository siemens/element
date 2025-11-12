/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import {
  addIcons,
  elementCancel,
  SiIconComponent,
  SiStatusIconComponent,
  STATUS_ICON_CONFIG
} from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SI_TOAST_AUTO_HIDE_DELAY, SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification',
  imports: [NgClass, SiLinkModule, SiIconComponent, SiStatusIconComponent, SiTranslatePipe],
  templateUrl: './si-toast-notification.component.html',
  styleUrl: './si-toast-notification.component.scss'
})
export class SiToastNotificationComponent {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  readonly toast = input.required<SiToast>();

  private closeAriaLabelDefault = t(() => $localize`:@@SI_TOAST.CLOSE:Close`);
  /** @internal */
  protected readonly closeAriaLabel = computed(
    () => this.toast().closeAriaLabel ?? this.closeAriaLabelDefault
  );
  /** @internal */
  protected readonly icons = addIcons({ elementCancel });
  /** @internal */
  protected readonly status = computed(() => {
    const toast = this.toast();
    if (toast.state === 'connection') {
      return 'danger';
    } else {
      return Object.keys(this.statusIcons).includes(toast.state) ? toast.state : 'info';
    }
  });
  /** @internal */
  protected readonly statusColor = computed(() => this.statusIcons[this.status()].color);
  /** @internal */
  protected readonly toastTimeoutInSeconds = computed(() => {
    const toast = this.toast();
    return toast.timeout ? toast.timeout / 1000 : SI_TOAST_AUTO_HIDE_DELAY / 1000;
  });
  /** @internal */
  protected readonly animationMode = signal('running');
  readonly paused = output<void>();
  readonly resumed = output<void>();
  /** @internal */
  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (!this.toast().disableAutoClose) {
      this.animationMode.set('paused');
      this.paused.emit();
    }
  }
  /** @internal */
  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    if (!this.toast().disableAutoClose) {
      this.animationMode.set('running');
      this.resumed.emit();
    }
  }
  /** @internal */
  protected close(): void {
    this.toast().close!();
  }
}
