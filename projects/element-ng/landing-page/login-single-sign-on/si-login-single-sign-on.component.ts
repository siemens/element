/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output } from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

/**
 * A single sign-on (SSO) login component that provides a button for SSO authentication.
 *
 * This component renders a simple button that users can click to initiate
 * single sign-on authentication flow.
 *
 * @example
 * ```html
 * <si-login-single-sign-on
 *   [ssoButtonLabel]="customLabel"
 *   [disableSso]="isLoading"
 *   (ssoEvent)="handleSsoLogin()">
 * </si-login-single-sign-on>
 * ```
 */
@Component({
  selector: 'si-login-single-sign-on',
  imports: [SiTranslatePipe],
  templateUrl: './si-login-single-sign-on.component.html'
})
export class SiLoginSingleSignOnComponent {
  /**
   * Label for login button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOGIN_SINGLE-SIGN-ON.LOGIN_SIGN_UP:Login / Sign un`)
   * ```
   */
  readonly ssoButtonLabel = input(
    t(() => $localize`:@@SI_LOGIN_SINGLE-SIGN-ON.LOGIN_SIGN_UP:Login / Sign un`)
  );
  /**
   * Disables the sso button.
   *
   * @defaultValue false
   */
  readonly disableSso = input(false);
  /**
   * Emits username and password on login event.
   */
  readonly ssoEvent = output<void>();

  protected ssoClick(): void {
    this.ssoEvent.emit();
  }
}
