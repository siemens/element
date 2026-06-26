/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { IconService } from './si-icons';

/**
 * Component to render a font or SVG icon depending on the configuration.
 * If no SVG icon is found, the component will fall back to render the icon-font.
 * In that case, an application must ensure that the icon font is loaded.
 * This component will only attach the respective class.
 *
 * The content of this component is hidden in the a11y tree.
 * If needed, the consumer must set proper labels.
 */
@Component({
  selector: 'si-icon',
  template: ` <div aria-hidden="true" [class]="svgIcon() ? 'svg-element-icon' : fontIcon()"></div>`,
  styleUrl: './si-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-icon]': 'icon()',
    '[style.--svg-element-icon]': 'svgIcon()'
  }
})
export class SiIconComponent {
  /**
   * Define which icon should be rendered.
   * Provide using:
   * - value of the icon map provided by `addIcons`
   * - (not recommended): plain string in kebab-case or camelCase
   *
   * @example
   * ```ts
   * import { elementUser } from '@siemens/element-icons';
   *
   * @Component({template: `
   *   <si-icon [icon]="icons.elementUser" />
   *   <si-icon icon="element-user" />
   *   <si-icon icon="elementUser" />
   *
   * `})
   * class MyComponent {
   *   icons = addIcons(elementUser);
   * }
   * ```
   */
  readonly icon = input.required<string>();

  private readonly iconService = inject(IconService);

  protected readonly svgIcon = computed(() => {
    const icon = this.iconService.getIcon(this.icon());
    if (!icon) {
      return undefined;
    }

    return `url("${icon.replace(/"/g, '\\"')}")`;
  });

  /** Icon class, which is ensured to be kebab-case. */
  protected readonly fontIcon = computed(() =>
    this.svgIcon() ? undefined : this.camelToKebabCase(this.icon())
  );

  private isKebabCase(str: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }

  /**
   * Converts a camelCase string to kebab-case.
   * If the string is already in kebab-case, it returns it unchanged.
   *
   * Note: This conversion has limitations with mixed alphanumeric cases.
   * Complex number-letter combinations may not convert as expected.
   */
  private camelToKebabCase(str: string): string {
    return this.isKebabCase(str)
      ? str
      : str
          ?.replace(/([a-z])([A-Z0-9])/g, '$1-$2')
          .replace(/([0-9])([A-Z])/g, '$1-$2')
          .toLowerCase();
  }
}
