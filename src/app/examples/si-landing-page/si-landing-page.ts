/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CopyrightDetails } from '@spike-rabbit/element-ng/copyright-notice';
import { SiLandingPageComponent } from '@spike-rabbit/element-ng/landing-page';
import { SiPasswordToggleModule } from '@spike-rabbit/element-ng/password-toggle';
@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, SiPasswordToggleModule, TranslateModule, RouterLink],
  templateUrl: './si-landing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };
}
