/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges
} from '@angular/core';
import {
  addIcons,
  elementCancel,
  SiIconNextComponent,
  SiStatusIconComponent,
  STATUS_ICON_CONFIG
} from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SI_TOAST_AUTO_HIDE_DELAY, SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification',
  imports: [NgClass, SiLinkModule, SiIconNextComponent, SiStatusIconComponent, SiTranslatePipe],
  templateUrl: './si-toast-notification.component.html',
  styleUrl: './si-toast-notification.component.scss'
})
export class SiToastNotificationComponent implements OnChanges {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  readonly toast = input.required<SiToast>();

  protected closeAriaLabel = t(() => $localize`:@@SI_TOAST.CLOSE:Close`);
  protected readonly icons = addIcons({ elementCancel });
  protected readonly status = computed(() => {
    const toast = this.toast();
    if (toast.state === 'connection') {
      return 'danger';
    } else {
      return Object.keys(this.statusIcons).includes(toast.state) ? toast.state : 'info';
    }
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.toast.currentValue) {
      this.closeAriaLabel = this.toast().closeAriaLabel ?? this.closeAriaLabel;
    }
  }

  protected close(): void {
    this.toast().close!();
  }
}
