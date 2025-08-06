/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { EntityStatusType } from '@spike-rabbit/element-ng/common';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { STATUS_ICON_CONFIG } from './icon-status';
import { SiIconNextComponent } from './si-icon-next.component';

@Component({
  selector: 'si-status-icon',
  imports: [NgClass, SiIconNextComponent, SiTranslatePipe],
  template: `
    @let iconValue = statusIcon();
    @if (iconValue) {
      <si-icon-next [ngClass]="iconValue.color" [icon]="iconValue.icon" />
      <si-icon-next [ngClass]="iconValue.stackedColor" [icon]="iconValue.stacked" />
      <span class="visually-hidden">{{ iconValue.ariaLabel | translate }}</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon-stack' }
})
export class SiStatusIconComponent {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);

  readonly status = input.required<EntityStatusType>();

  protected readonly statusIcon = computed(() => this.statusIcons[this.status()]);
}
