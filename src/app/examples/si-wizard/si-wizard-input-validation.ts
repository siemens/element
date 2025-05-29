/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { SiWizardComponent, SiWizardStepComponent } from '@siemens/element-ng/wizard';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-wizard-input-validation.html',
  host: { class: 'p-5' },
  imports: [SiWizardComponent, SiWizardStepComponent, SiInlineNotificationComponent, FormsModule]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  stepIsNextNavigable = true;
}
