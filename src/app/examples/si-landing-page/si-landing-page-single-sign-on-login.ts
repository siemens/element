/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CopyrightDetails } from '@siemens/element-ng/copyright-notice';
import {
  AlertConfig,
  SiLandingPageComponent,
  SiLoginSingleSignOnComponent
} from '@siemens/element-ng/landing-page';

@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, TranslateModule, SiLoginSingleSignOnComponent],
  templateUrl: './si-landing-page-single-sign-on-login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  private translate = inject(TranslateService);
  readonly loginSingleSignOn = viewChild.required(SiLoginSingleSignOnComponent);
  readonly loginAlert = signal<AlertConfig | undefined>(undefined);

  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };

  ngOnInit(): void {
    this.translate.set('DEMO.CONFIRM_LOGIN_MSG', 'Hello {{user}}! You have logged in.');
  }

  ssoLogin(): void {
    this.loginAlert.set({
      severity: 'success',
      message: 'DEMO.CONFIRM_LOGIN_MSG',
      translationParams: { user: 'User' }
    });
  }
}
