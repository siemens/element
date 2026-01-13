/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { EntityStatusType } from '@siemens/element-ng/common';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiIconComponent } from './si-icon.component';
import { STATUS_ICON_CONFIG } from './status-icon';

@Component({
  selector: 'si-status-icon',
  imports: [SiIconComponent, SiTranslatePipe],
  template: `
    @let iconValue = statusIcon();
    @if (iconValue) {
      <si-icon [class]="iconValue.color" [icon]="iconValue.icon" />
      <si-icon [class]="iconValue.stackedColor" [icon]="iconValue.stacked" />
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
