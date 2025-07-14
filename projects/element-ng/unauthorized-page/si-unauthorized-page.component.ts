/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * The component shall be use to indicate that an authenticated
 * user does not have the required permissions.
 *
 * @deprecated This component is deprecated and will be removed in the future.
 * Use the `SiInfoPageComponent` component with the `si-info-page` element instead.
 * The `SiInfoPageComponent` is a superset of this component and supports the same use cases
 * and more.
 */
@Component({
  selector: 'si-unauthorized-page',
  imports: [SiLinkDirective, SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-unauthorized-page.component.html',
  styleUrl: './si-unauthorized-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiUnauthorizedPageComponent {
  /**
   * The element warning icon.
   *
   * @defaultValue 'element-warning-filled'
   */
  readonly icon = input('element-warning-filled');
  /** The main heading indicating the problem. */
  readonly heading = input<TranslatableString>();
  /** A sub heading is a sentence summarizing the problem. */
  readonly subHeading = input<TranslatableString>();
  /** May be a longer description explaining the problem. */
  readonly description = input<TranslatableString>();
  /**
   * Use the link object if you have one option to follow. A link object
   * has a title to be displayed and can be configured with an external link,
   * a router link, or a custom action. If you want to provide multiple options,
   * add your own content into the component.
   */
  readonly link = input<Link>();
}
