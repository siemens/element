/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * @deprecated This component should no longer be used.
 * Use the {@link SiIconComponent} instead.
 * Existing usages can be replaced as follows:
 *
 * ```html
 * <!-- before -->
 * <si-icon icon="element-user" color="text-danger" />
 * <!-- after -->
 * <si-icon icon="element-user" class="icon text-danger" />
 * ```
 *
 * **Important:** Previously, the class `icon` was automatically applied. Unless not needed,
 * it must now be applied manually.
 * The icon class scales up the icon compared to its surrounding text.
 *
 * Stacked icons need to be constructed in HTML directly.
 * If applicable, the `si-status-icon` component should be used instead.
 *
 * ```html
 * <!-- before -->
 * <si-icon
 *   icon="element-circle-filled"
 *   color="status-success"
 *   stackedIcon="element-state-tick"
 *   stackedColor="status-success-contrast"
 *   alt="Success"
 * />
 *
 * <!-- after -->
 * <div class="icon-stack icon" aria-label="Success">
 *   <si-icon icon="element-circle-filled" class="status-success" />
 *   <si-icon icon="element-state-tick" class="status-success-contrast" />
 * </div>
 * ```
 */
@Component({
  selector: 'si-icon-legacy',
  imports: [SiTranslatePipe],
  templateUrl: './si-icon-legacy.component.html',
  styles: ':host, span { line-height: 1; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiIconLegacyComponent {
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
