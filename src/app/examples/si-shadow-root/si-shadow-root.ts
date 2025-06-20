/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { SiShadowRootDirective } from '@siemens/element-ng/shadow-root';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-shadow-root.html',
  styleUrl: 'not-element-styles.scss',
  host: { class: 'p-5' },
  standalone: true,
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, CdkTrapFocus],
  encapsulation: ViewEncapsulation.ShadowDom,
  hostDirectives: [SiShadowRootDirective]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  open = false;
}
