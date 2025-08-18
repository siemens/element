/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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
export class SampleComponent {
  readonly loginSingleSignOn = viewChild.required(SiLoginSingleSignOnComponent);
  readonly loginAlert = signal<AlertConfig | undefined>(undefined);

  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };

  ssoLogin(): void {
    this.loginAlert.set({ severity: 'success', message: 'You have logged in!' });
  }
}
