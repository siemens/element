/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiNavbarModule } from '@spike-rabbit/element-ng/navbar';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule],
  templateUrl: './si-navbar-primary-custom-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
