/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { animate, AnimationBuilder, style } from '@angular/animations';
import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnChanges,
  SimpleChanges,
  viewChild
} from '@angular/core';
import {
  addIcons,
  elementCancel,
  SiIconNextComponent,
  SiStatusIconComponent,
  STATUS_ICON_CONFIG
} from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiToast } from '../si-toast.model';

@Component({
  selector: 'si-toast-notification',
  imports: [NgClass, SiLinkModule, SiIconNextComponent, SiStatusIconComponent, SiTranslatePipe],
  templateUrl: './si-toast-notification.component.html',
  styleUrl: './si-toast-notification.component.scss'
})
export class SiToastNotificationComponent implements OnChanges {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  readonly toast = input.required<SiToast>();

  protected closeAriaLabel = $localize`:@@SI_TOAST.CLOSE:Close`;
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

  private readonly autoCloseBar = viewChild.required<ElementRef<HTMLDivElement>>('autoCloseBar');

  private animationBuilder = inject(AnimationBuilder);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.toast.currentValue) {
      const toast = this.toast();

      if (!toast.disableAutoClose && toast.timeout) {
        const animation = this.animationBuilder.build([
          style({ width: '100%' }),
          animate(toast.timeout, style({ width: '0%' }))
        ]);
        animation.create(this.autoCloseBar().nativeElement).play();
      }

      this.closeAriaLabel = this.toast().closeAriaLabel ?? this.closeAriaLabel;
    }
  }

  protected close(): void {
    this.toast().close!();
  }
}
