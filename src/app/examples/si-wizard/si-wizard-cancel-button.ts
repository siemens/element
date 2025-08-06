/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiWizardComponent, SiWizardStepComponent } from '@spike-rabbit/element-ng/wizard';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiWizardComponent, SiWizardStepComponent, FormsModule],
  templateUrl: './si-wizard-cancel-button.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  stepIsValid = true;
}
