/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, inject, signal } from '@angular/core';
import { elementDown2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [A11yModule, CdkOverlayOrigin, CdkConnectedOverlay, SiIconComponent],
  templateUrl: './dropdown-with-overlay.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly icons = addIcons({ elementDown2 });
  protected readonly open = signal(false);
}
