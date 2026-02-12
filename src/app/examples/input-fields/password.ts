/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SiPasswordStrengthComponent,
  SiPasswordStrengthDirective
} from '@siemens/element-ng/password-strength';
import { SiPasswordToggleComponent } from '@siemens/element-ng/password-toggle';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiFormItemComponent,
    SiPasswordStrengthComponent,
    SiPasswordStrengthDirective,
    SiPasswordToggleComponent,
    FormsModule
  ],
  templateUrl: './password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
