/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * The component displays application info messages. A message uses an icon and a title, optionally a copy text,
 * instructions and a link. Replace the integrated icon by content projection of another icon or image with the
 * CSS class `.si-info-image`. Use content projection with the CSS class `si-info-actions` to inject more buttons
 * and options to interact with the page.
 */
@Component({
  selector: 'si-info-page',
  imports: [NgClass, SiLinkDirective, SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-info-page.component.html',
  styleUrl: './si-info-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiInfoPageComponent {
  /**
   * The element warning icon.
   *
   * @defaultValue 'element-warning-filled'
   */
  readonly icon = input<string>('element-warning-filled');
  /**
   * Icon color class, see {@link https://element.siemens.io/fundamentals/typography/#color-variants-classes}
   *
   * @defaultValue 'status-warning'
   */
  readonly iconColor = input<string | undefined>('status-warning');
  /** A short and concise title to explain the error. */
  readonly titleText = input.required<TranslatableString>();
  /** A more detailed explanation of the error, outlining the reasoning for it and how a user can resolve it. */
  readonly copyText = input<TranslatableString>();
  /** A detailed instruction on how a user can resolve the error. */
  readonly instructions = input<TranslatableString>();
  /**
   * Use the link object if you have one option to follow. A link object
   * has a title to be displayed and can be configured with an external link,
   * a router link, or a custom action. If you want to provide multiple options,
   * add your own content into the component.
   */
  readonly link = input<Link>();
}
