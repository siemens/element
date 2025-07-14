/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { type StatusType } from '@siemens/element-ng/common';
import { SiIconNextComponent } from '@siemens/element-ng/icon';

export type BadgeType =
  | StatusType
  | 'default'
  | 'inverse'
  | 'info-emphasis'
  | 'success-emphasis'
  | 'warning-emphasis'
  | 'danger-emphasis'
  | 'critical-emphasis'
  | 'caution-emphasis';

@Component({
  selector: 'si-badge',
  imports: [SiIconNextComponent],
  template: `
    @let ico = icon();
    @if (ico) {
      <si-icon-next class="icon" [icon]="ico" />
    }
    <span class="text-truncate"><ng-content /></span>
  `,
  host: {
    role: 'status',
    class: 'badge',
    '[class]': '"bg-" + type()'
  }
})
export class SiBadgeComponent {
  /**
   * Optional icon
   * @defaultValue ''
   */
  readonly icon = input<string>();
  /**
   * Badge display type.
   * @defaultValue 'default'
   */
  readonly type = input<BadgeType>('default');
}
