/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { SiShadowRootDirective } from '@spike-rabbit/element-ng/shadow-root';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, CdkTrapFocus],
  standalone: true,
  templateUrl: './si-shadow-root.html',
  styleUrl: 'not-element-styles.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  host: { class: 'p-5' },
  hostDirectives: [SiShadowRootDirective]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  open = false;
}
