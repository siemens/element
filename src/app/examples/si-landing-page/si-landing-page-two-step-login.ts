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
  SiLandingPageComponent,
  SiLoginBasicComponent,
  UsernamePassword,
  UsernameValidationPayload
} from '@siemens/element-ng/landing-page';
import { LOG_EVENT, provideExampleRoutes } from '@siemens/live-preview';

const loginAlert = signal<AlertConfig | undefined>(undefined);

@Component({
  selector: 'app-two-step-login-wrapper',
  imports: [SiLoginBasicComponent, TranslateModule],
  template: `
    <si-login-basic
      usernameLabel="FORM.USERNAME"
      passwordLabel="FORM.PASSWORD"
      loginButtonLabel="FORM.LOGIN"
      backButtonLabel="FORM.BACK"
      nextButtonLabel="FORM.NEXT"
      [twoStep]="true"
      [loading]="loading()"
      [forgotPasswordLink]="{
        title: 'FORM.FORGOT_PASSWORD',
        href: 'https://myid.siemens.com/help/'
      }"
      [registerNowLink]="{
        title: 'FORM.REGISTER_NOW',
        href: 'https://myid.siemens.com/help/'
      }"
      (usernameValidation)="nextStep($event)"
      (valueChanged)="logEvent($event)"
      (login)="login($event)"
    />
  `
})
export class AppTwoStepLoginComponent {
  logEvent = inject(LOG_EVENT);
  readonly loading = signal<boolean>(false);

  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };

  login(data: UsernamePassword): void {
    if (!data.password || !data.username) {
      loginAlert.set({
        severity: 'danger',
        message: 'Please check your credentials and try again!'
      });
    } else {
      this.loading.set(true);
      loginAlert.set(undefined);
      setTimeout(() => {
        this.loading.set(false);
        this.logEvent('You have logged in!');
      }, 1500);
    }
  }

  nextStep(event: UsernameValidationPayload): void {
    if (event.username) {
      setTimeout(() => {
        loginAlert.set(undefined);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.username!);
        event.validate(isEmail);
        if (!isEmail) {
          loginAlert.set({
            severity: 'danger',
            message: 'Please provide a valid username!'
          });
        }
      }, 750); // simulate a short delay
    } else {
      loginAlert.set({
        severity: 'danger',
        message: 'Please check your username and try again!'
      });
    }
    this.logEvent(event);
  }
}

export const ROUTES: Route[] = [
  {
    path: 'login2step',
    component: AppTwoStepLoginComponent
  }
];

@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, TranslateModule, RouterOutlet],
  templateUrl: './si-landing-page-two-step-login.html',
  providers: [provideExampleRoutes(ROUTES)],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit, OnDestroy {
  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);
  readonly loginAlert = loginAlert;

  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };

  ngOnInit(): void {
    this.router.navigate(['login2step'], { relativeTo: this.activeRoute });
  }

  ngOnDestroy(): void {
    loginAlert.set(undefined);
  }
}
