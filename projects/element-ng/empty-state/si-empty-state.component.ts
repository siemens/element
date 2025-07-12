/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-empty-state',
  imports: [SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-empty-state.component.html',
  styleUrl: './si-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiEmptyStateComponent {
  /**
   * CSS class name of the desired icon.
   */
  readonly icon = input.required<string>();

  /**
   * Heading of empty state content.
   */
  readonly heading = input.required<TranslatableString>();

  /**
   * Description of empty state content.
   */
  readonly content = input<TranslatableString>();
}
