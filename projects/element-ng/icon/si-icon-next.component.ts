/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  input,
  Provider
} from '@angular/core';

import { IconService } from './si-icons';

/**
 * Global configuration for icons.
 *
 * @experimental
 */
export interface IconConfig {
  /**
   * If true, the si-icon-next component will always render the icon font instead of the svg.
   *
   * @defaultValue true
   */
  disableSvgIcons?: boolean;
}

const ICON_CONFIG = new InjectionToken<IconConfig>('ICON_CONFIG', {
  providedIn: 'root',
  factory: () => ({ disableSvgIcons: true })
});

/**
 * Configure how Element handles icons. Provide only once in your global configuration.
 *
 * @experimental
 */
export const provideIconConfig = (config: IconConfig): Provider => ({
  provide: ICON_CONFIG,
  useValue: config
});

/**
 * Component to render a font or SVG icon depending on the configuration.
 * If no SVG icon is found, the component will fall back to render the icon-font.
 * In that case, an application must ensure that the icon font is loaded.
 * This component will only attach the respective class.
 *
 * The content of this component is hidden in the a11y tree.
 * If needed, the consumer must set proper labels.
 *
 * @experimental
 */
@Component({
  selector: 'si-icon-next',
  imports: [NgClass],
  template: ` <div
    aria-hidden="true"
    [ngClass]="svgIcon() ? '' : fontIcon()"
    [innerHTML]="svgIcon()"
  ></div>`,
  styles: `
    :host {
      display: inline-flex;
      font-weight: normal;
      vertical-align: middle;
      line-height: 1;

      ::ng-deep svg {
        display: block;
        block-size: 1em;
        fill: currentColor;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-icon]': 'icon()'
  }
})
export class SiIconNextComponent {
  /**
   * Define which icon should be rendered.
   * Provide using:
   * - value of the icon map provided by `addIcons`
   * - (not recommended): plain string in kebab-case or camelCase
   *
   * @example
   * ```ts
   * import { elementUser } from '@simpl/element-icons/ionic';
   *
   * @Component({template: `
   *   <si-icon-next [icon]="icons.elementUser" />
   *   <si-icon-next icon="element-user" />
   *   <si-icon-next icon="elementUser" />
   *
   * `})
   * class MyComponent {
   *   icons = addIcons(elementUser);
   * }
   * ```
   */
  readonly icon = input.required<string>();

  private readonly config = inject(ICON_CONFIG);
  private readonly iconService = inject(IconService);

  protected readonly svgIcon = computed(() =>
    this.config.disableSvgIcons ? undefined : this.iconService.getIcon(this.icon())
  );

  /** Icon class, which is ensured to be kebab-case. */
  protected readonly fontIcon = computed(() =>
    this.svgIcon() ? undefined : this.camelToKebabCase(this.icon())
  );

  private camelToKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
      .replace(/([0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
}
