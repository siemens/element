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
  UsernamePassword
} from '@siemens/element-ng/landing-page';
import { LOG_EVENT, provideExampleRoutes } from '@siemens/live-preview';

const loginAlert = signal<AlertConfig | undefined>(undefined);

@Component({
  selector: 'app-login-basic-wrapper',
  imports: [TranslateModule, SiLoginBasicComponent],
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
  readonly loading = signal<boolean>(false);
  readonly loginAlert = signal<AlertConfig | undefined>(undefined);
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
          this.logEvent('You have logged in!');
        }, 1500);
      }
    }
  }
}

export const ROUTES: Route[] = [
  {
    path: 'login',
    component: AppLoginBasicComponent
  }
];

@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, TranslateModule, RouterOutlet],
  templateUrl: './si-landing-page-basic-login.html',
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
    this.router.navigate(['login'], { relativeTo: this.activeRoute });
  }

  ngOnDestroy(): void {
    loginAlert.set(undefined);
  }
}
