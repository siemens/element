/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-tab-badge',
  imports: [SiTranslatePipe],
  templateUrl: './si-tab-badge.component.html',
  styleUrl: './si-tab-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-contents'
  }
})
export class SiTabBadgeComponent {
  /**
   * Content displayed in the tab badge. Set to `true` to display a red dot.
   */
  readonly badgeContent = input<TranslatableString | boolean>();
  /**
   * Background color of the badge. When omitted, string content is displayed in a red dot badge.
   */
  readonly badgeColor = input<string>();
}
