/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiWizardComponent, SiWizardStepComponent } from '@siemens/element-ng/wizard';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-wizard.html',
  host: { class: 'p-5' },
  imports: [SiWizardComponent, SiWizardStepComponent, FormsModule]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  stepIsValid = true;
}
