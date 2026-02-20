/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Route, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CopyrightDetails } from '@siemens/element-ng/copyright-notice';
import {
  AlertConfig,
  SiChangePasswordComponent,
  ChangePassword,
  UsernamePassword,
  SiLandingPageComponent,
  SiLoginBasicComponent
} from '@siemens/element-ng/landing-page';
import { PasswordPolicy } from '@siemens/element-ng/password-strength';
import { LOG_EVENT, provideExampleRoutes } from '@siemens/live-preview';

const loginAlert = signal<AlertConfig | undefined>(undefined);

@Component({
  selector: 'app-login-basic-wrapper',
  imports: [SiLoginBasicComponent, TranslateModule],
  template: `
    <si-login-basic
      usernameLabel="FORM.USERNAME"
      passwordLabel="FORM.PASSWORD"
      loginButtonLabel="FORM.LOGIN"
      [loading]="loading()"
      [forgotPasswordLink]="{ href: 'https://myid.siemens.com/help/' }"
      [registerNowLink]="{ href: 'https://myid.siemens.com/help/' }"
      (valueChanged)="logEvent($event)"
      (login)="login($event)"
    />
  `
})
export class AppLoginBasicComponent {
  logEvent = inject(LOG_EVENT);
  private activeRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly loading = signal<boolean>(false);

  login(data: UsernamePassword): void {
    if (!data.password || !data.username) {
      loginAlert.set({
        severity: 'danger',
        message: 'Please check your credentials and try again!'
      });
    } else {
      loginAlert.set(undefined);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username!);
      if (!isEmail) {
        loginAlert.set({
          severity: 'danger',
          message: 'Please provide a valid username!'
        });
      } else {
        this.loading.set(true);
        loginAlert.set(undefined);
        setTimeout(() => {
          this.loading.set(false);
          this.router.navigate(['change-password'], { relativeTo: this.activeRoute.parent });
        }, 1500);
      }
    }
  }
}

@Component({
  selector: 'app-change-password-wrapper',
  imports: [SiChangePasswordComponent, TranslateModule],
  template: `
    <si-change-password
      [passwordPolicyContent]="passwordPolicyContent"
      [passwordStrength]="passwordStrength"
      [changePasswordAlert]="changePasswordAlert()"
      (valueChanged)="logEvent($event)"
      (passwordStrengthChanged)="setPasswordStrength($event)"
      (changePasswordRequested)="updatePassword($event)"
      (back)="handleBackClick()"
    >
      <ng-template #passwordPolicyContent>
        Enter a password with 8 characters containing at least:
        <ul class="ps-8">
          <li>1 upper case letter [A..Z]</li>
          <li>1 lower case letter [a..z]</li>
          <li>1 number [0..9]</li>
          <li>1 special character [$,#,...]</li>
        </ul>
      </ng-template></si-change-password
    >
  `
})
export class AppChangePasswordComponent {
  logEvent = inject(LOG_EVENT);
  private activeRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly loginAlert = signal<AlertConfig | undefined>(undefined);
  readonly changePasswordAlert = signal<AlertConfig | undefined>(undefined);
  readonly showChangePassword = signal(true);

  passwordStrength: PasswordPolicy = {
    minLength: 8,
    uppercase: true,
    lowercase: true,
    digits: true,
    special: true
  };

  passwordStrengthLevel: number | void | undefined;

  updatePassword(data: ChangePassword): void {
    if (!this.showChangePassword()) {
      return;
    }
    const level = this.passwordStrengthLevel;
    if (!data.newPassword || !data.confirmPassword) {
      this.changePasswordAlert.set({
        severity: 'danger',
        message: 'Please check your password and try again!'
      });
    } else if (data.newPassword !== data.confirmPassword) {
      this.changePasswordAlert.set({
        severity: 'danger',
        message: 'The passwords do not match!'
      });
    } else if (level !== 0) {
      this.changePasswordAlert.set({
        severity: 'danger',
        message: `The password must follow the policy requirements.`
      });
    } else {
      this.changePasswordAlert.set(undefined);
      this.logEvent('You have changed your password!');
    }
  }

  setPasswordStrength(data: number | void): void {
    this.passwordStrengthLevel = data;
  }

  handleBackClick(): void {
    this.loginAlert.set(undefined);
    this.changePasswordAlert.set(undefined);
    this.router.navigate(['login'], { relativeTo: this.activeRoute.parent });
  }
}

export const ROUTES: Route[] = [
  {
    path: 'login',
    component: AppLoginBasicComponent
  },
  { path: 'change-password', component: AppChangePasswordComponent }
];

@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, TranslateModule, RouterOutlet],
  templateUrl: './si-landing-page-change-password.html',
  providers: [provideExampleRoutes(ROUTES)],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit, OnDestroy {
  private activeRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly loginAlert = loginAlert;

  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };

  ngOnInit(): void {
    this.router.navigate(['change-password'], { relativeTo: this.activeRoute });
  }

  ngOnDestroy(): void {
    loginAlert.set(undefined);
  }
}
