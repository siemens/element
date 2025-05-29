/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiWizardStepComponent } from './si-wizard-step.component';
import { SiWizardComponent } from './si-wizard.component';

@NgModule({
  imports: [SiWizardComponent, SiWizardStepComponent],
  exports: [SiWizardComponent, SiWizardStepComponent]
})
export class SiWizardModule {}
