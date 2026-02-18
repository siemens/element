/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  input,
  OnInit,
  output,
  signal,
  DestroyRef,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { SiPasswordToggleComponent } from '@siemens/element-ng/password-toggle';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { UsernamePassword, UsernameValidationPayload } from '../si-landing-page.model';

/**
 * A basic login component that supports both single-step and two-step authentication flows.
 *
 * This component provides a standard login form with username and password fields.
 * It can be configured to work in two-step mode where username validation happens first,
 * followed by password entry.
 *
 * @example
 * ```html
 * <si-login-basic
 *   [forgotPasswordLink]="forgotPasswordLink"
 *   [registerNowLink]="registerNowLink"
 *   [twoStep]="true"
 *   [loading]="isLoading"
 *   (login)="handleLogin($event)"
 *   (usernameValidation)="handleUsernameValidation($event)">
 * </si-login-basic>
 * ```
 */
@Component({
  selector: 'si-login-basic',
  imports: [
    ReactiveFormsModule,
    SiTranslatePipe,
    SiLinkDirective,
    SiPasswordToggleComponent,
    SiLoadingButtonComponent
  ],
  templateUrl: './si-login-basic.component.html',
  styleUrl: './si-login-basic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiLoginBasicComponent implements OnInit {
  private static idCounter = 0;
  /**
   * Label for username input field.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOGIN_BASIC.USERNAME:Username`)
   * ```
   */
  readonly usernameLabel = input(t(() => $localize`:@@SI_LOGIN_BASIC.USERNAME:Username`));
  /**
   * Label for password input field.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOGIN_BASIC.PASSWORD:Password`)
   * ```
   */
  readonly passwordLabel = input(t(() => $localize`:@@SI_LOGIN_BASIC.PASSWORD:Password`));
  /**
   * Config for Forgot Password link.
   */
  readonly forgotPasswordLink = input<Link>();
  /**
   * Config for Register Now link.
   */
  readonly registerNowLink = input<Link>();
  /**
   * Label for login button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOGIN_BASIC.LOGIN:Login`)
   * ```
   */
  readonly loginButtonLabel = input(t(() => $localize`:@@SI_LOGIN_BASIC.LOGIN:Login`));
  /**
   * Disables the login button.
   *
   * @defaultValue false
   */
  readonly disableLogin = input(false);
  /**
   * Enables the two-step login flow.
   *
   * @defaultValue false
   */
  readonly twoStep = input(false, { transform: booleanAttribute });

  /**
   * Indicates whether the login button should show a loading state.
   *
   * @defaultValue false
   */
  readonly loading = input(false);
  /**
   * Description of back button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOGIN_BASIC.BACK:Back`)
   * ```
   */
  readonly backButtonLabel = input(t(() => $localize`:@@SI_LOGIN_BASIC.BACK:Back`));
  /**
   * Description of next button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOGIN_BASIC.NEXT:Next`)
   * ```
   */
  readonly nextButtonLabel = input(t(() => $localize`:@@SI_LOGIN_BASIC.NEXT:Next`));
  /**
   * Emits username when user clicks on next button.
   */
  readonly usernameValidation = output<UsernameValidationPayload>();
  /**
   * Emits username and password on value change.
   */
  readonly valueChanged = output<UsernamePassword>();
  /**
   * Emits username and password on login event.
   */
  readonly login = output<UsernamePassword>();

  private destroyRef = inject(DestroyRef);
  protected readonly secondStepVisible = signal(false);
  protected readonly loadingNext = signal(false);

  private readonly index = SiLoginBasicComponent.idCounter++;
  protected usernameId = `__si-login-basic-username-${this.index}`;
  protected passwordId = `__si-login-basic-password-${this.index}`;

  protected loginCredentials = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.loginCredentials.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.handleValueChanges();
    });

    this.loginCredentials.controls.username.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.secondStepVisible() && this.goBack());
  }

  protected submit(): void {
    if (this.twoStep() && !this.secondStepVisible()) {
      this.validateUsername();
      return;
    }
    this.login.emit(this.getLoginFormValues());
  }

  protected handleValueChanges(): void {
    this.valueChanged.emit(this.getLoginFormValues());
  }

  protected validateUsername(): void {
    if (this.loginCredentials.controls.username.valid) {
      this.loadingNext.set(true);
    }
    const activateArgs = {
      ...this.getLoginFormValues(),
      validate: (isValid: boolean): void => {
        if (isValid) {
          this.nextStep();
        } else {
          this.loadingNext.set(false);
          this.loginCredentials.controls.username.setErrors({ invalid: true });
        }
      }
    };
    this.usernameValidation.emit(activateArgs);
  }

  private getLoginFormValues(): UsernamePassword {
    const { username: username, password } = this.loginCredentials.value;
    return { username: username, password };
  }

  protected goBack(): void {
    this.secondStepVisible.set(false);
    this.loginCredentials.controls.password.reset();
  }

  private nextStep(): void {
    if (this.twoStep() && !this.secondStepVisible()) {
      this.loadingNext.set(false);
      this.secondStepVisible.set(true);
    }
  }
}
