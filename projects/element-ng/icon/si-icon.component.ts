/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-icon',
  imports: [NgClass, SiTranslateModule],
  templateUrl: './si-icon.component.html',
  styles: ':host, span { line-height: 1; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiIconComponent {
  /** Icon token, see {@link https://element.siemens.io/icons/element} */
  readonly icon = input<string>();
  /** Color class, see {@link https://element.siemens.io/fundamentals/typography/#color-variants-classes} */
  readonly color = input<string>();
  /** Icon token, see {@link https://element.siemens.io/fundamentals/icons/} */
  readonly stackedIcon = input<string>();
  /** Color class, see {@link https://element.siemens.io/fundamentals/icons/} */
  readonly stackedColor = input<string>();
  /** Alternative name or translation key for icon. Used for A11y. */
  readonly alt = input<TranslatableString>();
  /**
   * Text-size class for icon size, see {@link https://element.siemens.io/fundamentals/typography/#type-styles-classes}
   *
   * @defaultValue 'icon'
   */
  readonly size = input<string>('icon');

  protected readonly altText = computed(() => {
    return this.alt() ?? this.icon()?.replace('element-', '').split('-').join(' ') ?? '';
  });
}
