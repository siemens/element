/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiTranslatePipe, TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

@Component({
  selector: 'si-tab-badge',
  imports: [SiTranslatePipe, NgClass],
  templateUrl: './si-tab-badge.component.html',
  styleUrl: './si-tab-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-contents'
  }
})
export class SiTabBadgeComponent {
  readonly badgeContent = input<TranslatableString | boolean>();
  readonly badgeColor = input<string>();
}
