/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideCopyrightDetails } from '@siemens/element-ng/copyright-notice';
import { SiLandingPageComponent } from '@siemens/element-ng/landing-page';
import { SiPasswordToggleModule } from '@siemens/element-ng/password-toggle';

@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, SiPasswordToggleModule, TranslateModule, RouterLink],
  templateUrl: './si-landing-page.html',
  providers: [
    provideCopyrightDetails({
      startYear: 2021,
      lastUpdateYear: 2023,
      company: 'Example Company'
    })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
