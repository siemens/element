/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import { elementCancel } from '@siemens/element-icons';
import {
  addIcons,
  SiIconComponent,
  SiStatusIconComponent,
  STATUS_ICON_CONFIG
} from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SI_TOAST_AUTO_HIDE_DELAY, SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification',
  imports: [SiLinkModule, SiIconComponent, SiStatusIconComponent, SiTranslatePipe],
  templateUrl: './si-toast-notification.component.html',
  styleUrl: './si-toast-notification.component.scss'
})
export class SiToastNotificationComponent {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  readonly toast = input.required<SiToast>();

  private closeAriaLabelDefault = t(() => $localize`:@@SI_TOAST.CLOSE:Close`);
  protected readonly closeAriaLabel = computed(
    () => this.toast().closeAriaLabel ?? this.closeAriaLabelDefault
  );
  protected readonly icons = addIcons({ elementCancel });
  protected readonly status = computed(() => {
    const toast = this.toast();
    return Object.keys(this.statusIcons).includes(toast.state) ? toast.state : 'info';
  });
  protected readonly statusColor = computed(() => this.statusIcons[this.status()].color);
  protected readonly toastTimeoutInSeconds = computed(() => {
    const toast = this.toast();
    return toast.timeout ? toast.timeout / 1000 : SI_TOAST_AUTO_HIDE_DELAY / 1000;
  });
  protected readonly animationMode = signal('running');
  readonly paused = output<void>();
  readonly resumed = output<void>();

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (!this.toast().disableAutoClose) {
      this.animationMode.set('paused');
      this.paused.emit();
    }
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    if (!this.toast().disableAutoClose) {
      this.animationMode.set('running');
      this.resumed.emit();
    }
  }

  protected close(): void {
    this.toast().close!();
  }
}
