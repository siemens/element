/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CopyrightDetails, SiCopyrightNoticeComponent } from '@siemens/element-ng/copyright-notice';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  IsoLanguageValue,
  SiLanguageSwitcherComponent
} from '@siemens/element-ng/language-switcher';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { AlertConfig } from './alert-config.model';

@Component({
  selector: 'si-landing-page',
  imports: [
    SiCopyrightNoticeComponent,
    SiLanguageSwitcherComponent,
    SiLinkDirective,
    SiInlineNotificationComponent,
    SiTranslateModule
  ],
  templateUrl: './si-landing-page.component.html',
  styleUrl: './si-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiLandingPageComponent {
  /**
   * Heading of the application.
   */
  readonly heading = input.required<string>();
  /**
   * Secondary heading of the application.
   */
  readonly subheading = input<string>();
  /**
   * Short description of the application.
   */
  readonly subtitle = input.required<string>();
  /**
   * List of links (e.g. Corporate information)
   *
   * @defaultValue []
   */
  readonly links = input<Link[]>([]);

  /**
   * URL to custom background image
   *
   * @defaultValue './assets/images/landing-page-steel.webp'
   */
  readonly backgroundImageUrl = input('./assets/images/landing-page-steel.webp');

  /**
   * URL to custom brand image.
   *
   * @deprecated By default the logo provided in the theme will be used.
   * For a different logo use the respective CSS variables:
   * ```html
   * <si-landing-page style="--landing-page-logo: url('https://example.com'); --landing-page-logo-width: 100px; --landing-page-logo-height: 100px" />
   * ```
   */
  readonly logoUrl = input<string>();

  /**
   * Input of si-language-switcher: Key for translation.
   * If your languages are already translated, you may display them without any
   * manipulation by passing in an empty string.
   *
   * @defaultValue 'LANGUAGE'
   */
  readonly translationKey = input('LANGUAGE');
  /**
   * Input of si-language-switcher: List of all available languages in this
   * application.
   */
  readonly availableLanguages = input<string[] | IsoLanguageValue[]>();

  /**
   *
   * Config to enable/disable general alerts on landing page
   */
  readonly announcement = input<AlertConfig>();

  /**
   *
   * Config to enable/disable login related error/alerts
   */
  readonly loginAlert = input<AlertConfig>();

  /**
   * Version of the application
   */
  readonly version = input<string>();

  /**
   * Copyright information to be displayed. Alternatively, you can use the {@link SI_COPYRIGHT_DETAILS} global inject.
   */
  readonly copyrightDetails = input<CopyrightDetails>();
}
