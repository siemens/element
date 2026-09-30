/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-empty-state',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-empty-state.component.html',
  styleUrl: './si-empty-state.component.scss'
})
export class SiEmptyStateComponent {
  /**
   * CSS class name of the desired icon.
   */
  readonly icon = input<string>();

  /**
   * Heading of empty state content.
   */
  readonly heading = input.required<TranslatableString>();

  /**
   * Description of empty state content.
   */
  readonly content = input<TranslatableString>();

  /**
   * Enables automatic adaptation to the available height.
   * When disabled, all supplied elements remain visible.
   * @defaultValue false
   */
  readonly responsiveMode = input(false, { transform: booleanAttribute });
}
