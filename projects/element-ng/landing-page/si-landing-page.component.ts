/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef, signal } from '@angular/core';
import { CopyrightDetails, SiCopyrightNoticeComponent } from '@siemens/element-ng/copyright-notice';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  IsoLanguageValue,
  SiLanguageSwitcherComponent
} from '@siemens/element-ng/language-switcher';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { AlertConfig } from './alert-config.model';
import { LandingPageWarning } from './si-landing-page.model';

/**
 * A comprehensive landing page component that provides a standardized layout for authentication flows.
 * 
 * This component serves as a container for various authentication-related components and provides
 * a consistent layout with support for branding, internationalization, legal acknowledgments,
 * and various notification types. It includes slots for custom content and handles responsive
 * layout adjustments.
 * 
 * The component supports:
 * - Custom branding and background images
 * - Multi-language support with language switcher
 * - Legal acknowledgments and terms display
 * - Alert and notification systems
 * - Copyright information display
 * - Responsive layout with full-height section option
 * 
 * @example
 * ```html
 * <si-landing-page
 *   [heading]="appTitle"
 *   [subtitle]="appDescription"
 *   [availableLanguages]="languages"
 *   [copyrightDetails]="copyright"
 *   [announcement]="announcementConfig"
 *   [loginAlert]="loginErrorConfig">
 *   
 *   <si-login-basic
 *     (login)="handleLogin($event)"
 *     (usernameValidation)="validateUsername($event)">
 *   </si-login-basic>

 * </si-landing-page>
 * ```
 */
@Component({
  selector: 'si-landing-page',
  imports: [
    SiCopyrightNoticeComponent,
    SiLanguageSwitcherComponent,
    SiLinkDirective,
    SiInlineNotificationComponent,
    SiTranslatePipe,
    NgTemplateOutlet
  ],
  templateUrl: './si-landing-page.component.html',
  styleUrl: './si-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiLandingPageComponent {
  /**
   * Heading of the application.
   */
  readonly heading = input.required<TranslatableString>();
  /**
   * Secondary heading of the application.
   */
  readonly subheading = input<TranslatableString>();
  /**
   * Short description of the application.
   */
  readonly subtitle = input.required<TranslatableString>();
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
   *
   * @defaultValue []
   */
  readonly availableLanguages = input<string[] | IsoLanguageValue[]>([]);

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
   * Warning text for Live Data. Can be shown, if there is no legal artifact which needs immediate user attention.
   */
  readonly liveDataWarning = input<LandingPageWarning>();
  /**
   * Text for some legal artifacts (e.g. Terms of Use) that needs more attention before the login.
   */
  readonly implicitLegalAcknowledge = input<string | TemplateRef<unknown>>();
  /**
   * Version of the application.
   */
  readonly version = input<string>();

  /**
   * Copyright information to be displayed. Alternatively, you can use the {@link SI_COPYRIGHT_DETAILS} global inject.
   */
  readonly copyrightDetails = input<CopyrightDetails>();
  /**
   * Option to display the landing page content in full height.
   *
   * @defaultValue false
   */
  readonly isFullHeightSection = signal(false);
}
