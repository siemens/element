/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { SiWizardComponent, SiWizardStepComponent } from '@siemens/element-ng/wizard';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiWizardComponent, SiWizardStepComponent, SiInlineNotificationComponent, FormsModule],
  templateUrl: './si-wizard-input-validation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  stepIsNextNavigable = true;
}
