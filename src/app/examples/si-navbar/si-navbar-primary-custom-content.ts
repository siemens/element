/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiNavbarModule } from '@siemens/element-ng/navbar';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-navbar-primary-custom-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [SiNavbarModule]
})
export class SampleComponent {
  primaryItems = [
    {
      title: 'Callback Function',
      action: () => this.myCustomFunction()
    }
  ];

  myCustomFunction(): void {
    this.logEvent('My Function was executed');
  }

  // the real function is injected by the previewer
  logEvent = inject(LOG_EVENT);
}
