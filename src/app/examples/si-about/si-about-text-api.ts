/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiAboutComponent } from '@siemens/element-ng/about';
import { provideCopyrightDetails } from '@siemens/element-ng/copyright-notice';

@Component({
  selector: 'app-sample',
  imports: [SiAboutComponent],
  templateUrl: './si-about-text-api.html',
  providers: [
    provideCopyrightDetails({
      company: 'Sample Company',
      startYear: 2016,
      lastUpdateYear: 2021
    })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  licenseIntro = `Provide a disclaimer here about the thrid-party software
licenses provided in the component list below.

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
sit amet.`;
}
