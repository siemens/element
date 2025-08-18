/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  input,
  OnInit,
  output,
  TemplateRef,
  OnDestroy,
  inject,
  DestroyRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  PasswordPolicy,
  SiPasswordStrengthComponent,
  SiPasswordStrengthDirective
} from '@siemens/element-ng/password-strength';
import { SiPasswordToggleComponent } from '@siemens/element-ng/password-toggle';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { AlertConfig } from '../alert-config.model';
import { SiLandingPageComponent } from '../si-landing-page.component';
import { ChangePassword } from '../si-landing-page.model';

/**
 * A component for changing user passwords with strength validation and policy enforcement.
 *
 * This component provides a form for users to change their password, including
 * password strength indicators, policy validation, and confirmation fields.
 * It supports custom password policies and displays inline notifications for alerts.
 *
 * @example
 * ```html
 * <si-change-password
 *   [passwordStrength]="passwordPolicy"
 *   [passwordPolicyContent]="policyTemplate"
 *   [changePasswordAlert]="alertConfig"
 *   (changePasswordRequested)="handlePasswordChange($event)"
 *   (back)="handleBack()">
 * </si-change-password>
 * ```
 */
@Component({
  selector: 'si-change-password',
  imports: [
    ReactiveFormsModule,
    SiTranslatePipe,
    SiPasswordToggleComponent,
    NgTemplateOutlet,
    SiInlineNotificationComponent,
    SiPasswordStrengthComponent,
    SiPasswordStrengthDirective
  ],
  templateUrl: './si-change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiChangePasswordComponent implements OnInit, OnDestroy {
  private static idCounter = 0;
  /**
   * Change password heading.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.CHANGE_PASSWORD:Change password`)
   * ```
   */
  readonly heading = input(
    t(() => $localize`:@@SI_CHANGE_PASSWORD.CHANGE_PASSWORD:Change password`)
  );
  /**
   * Short description of the action to perform.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.CHANGE_FACTORY_PASSWORD:Factory set password must be changed`)
   * ```
   */
  readonly subheading = input(
    t(
      () =>
        $localize`:@@SI_CHANGE_PASSWORD.CHANGE_FACTORY_PASSWORD:Factory set password must be changed`
    )
  );
  /**
   * Label for new password input field.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.NEW_PASSWORD:New password`)
   * ```
   */
  readonly newPasswordLabel = input(
    t(() => $localize`:@@SI_CHANGE_PASSWORD.NEW_PASSWORD:New password`)
  );
  /**
   * Label for confirm password input field.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.CONFIRM_PASSWORD:Confirm password`)
   * ```
   */
  readonly confirmPasswordLabel = input(
    t(() => $localize`:@@SI_CHANGE_PASSWORD.CONFIRM_PASSWORD:Confirm password`)
  );
  /**
   * Label for change password button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.CHANGE:Change`)
   * ```
   */
  readonly changeButtonLabel = input(t(() => $localize`:@@SI_CHANGE_PASSWORD.CHANGE:Change`));
  /**
   * Description of back button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.BACK:Back`)
   * ```
   */
  readonly backButtonLabel = input(t(() => $localize`:@@SI_CHANGE_PASSWORD.BACK:Back`));
  /**
   * Disables the change password button.
   *
   * @defaultValue false
   */
  readonly disableChange = input(false);
  /**
   * Title of the password policy.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHANGE_PASSWORD.PASSWORD_POLICY:Password policy`)
   * ```
   */
  readonly passwordPolicyTitle = input(
    t(() => $localize`:@@SI_CHANGE_PASSWORD.PASSWORD_POLICY:Password policy`)
  );
  /**
   * Description of the password policy requirements.
   */
  readonly passwordPolicyContent = input.required<string | TemplateRef<unknown>>();
  /**
   * Description of the password policy requirements.
   */
  readonly passwordStrength = input.required<PasswordPolicy>();
  /**
   * Config to enable/disable password related error/alerts.
   */
  readonly changePasswordAlert = input<AlertConfig>();
  /**
   * Emits password on value change.
   */
  readonly valueChanged = output<ChangePassword>();
  /**
   * Emits password on change event.
   */
  readonly changePasswordRequested = output<ChangePassword>();
  /**
   * The number indicating the number of rules which still can be met. (`-2` --\> 2 rules are
   * still unmet, `0` --\> all met)
   */
  readonly passwordStrengthChanged = output<number | void>();
  /**
   * Emits on back click.
   */
  readonly back = output<void>();
  /**
   * Reference to the landing page parent component.
   */
  protected landingPage = inject(SiLandingPageComponent, { skipSelf: true, optional: true });

  private readonly index = SiChangePasswordComponent.idCounter++;
  protected newPasswordId = `__si-change-password-new-password-${this.index}`;
  protected confirmPasswordId = `__si-change-password-confirm-password-${this.index}`;

  protected changePasswordForm = new FormGroup({
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });
  protected passwordPolicyContentTemplate: TemplateRef<any> | null = null;

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.landingPage?.isFullHeightSection.set(true);
    const passwordPolicy = this.passwordPolicyContent();
    if (passwordPolicy instanceof TemplateRef) {
      this.passwordPolicyContentTemplate = passwordPolicy;
    }
    this.changePasswordForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.handleValueChanges();
    });
  }

  ngOnDestroy(): void {
    this.landingPage?.isFullHeightSection.set(false);
  }

  protected submit(): void {
    this.changePasswordRequested.emit(this.getPasswordFormValues());
  }

  protected handleValueChanges(): void {
    this.valueChanged.emit(this.getPasswordFormValues());
  }

  protected handlePasswordStrengthChanged(data: number | void): void {
    this.passwordStrengthChanged.emit(data);
  }

  private getPasswordFormValues(): ChangePassword {
    const { newPassword: newPassword, confirmPassword } = this.changePasswordForm.value;
    return { newPassword: newPassword, confirmPassword };
  }

  protected handleBackClick(): void {
    this.back.emit();
    this.changePasswordForm.reset();
  }
}
