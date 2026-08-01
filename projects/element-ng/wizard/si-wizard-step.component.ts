/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input, output, signal } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-wizard-step',
  templateUrl: './si-wizard-step.component.html'
})
export class SiWizardStepComponent {
  /**
   * Heading displayed for the wizard step.
   *
   * @defaultValue ''
   */
  readonly heading = input<TranslatableString>('');
  /**
   * Whether the step is valid and allows navigation to subsequent steps.
   *
   * @defaultValue true
   */
  readonly isValid = input(true, { transform: booleanAttribute });
  /**
   * Whether the wizard navigates to the next step after emitting `next`.
   *
   * @defaultValue true
   */
  readonly isNextNavigable = input(true, { transform: booleanAttribute });
  /**
   * Whether the step is shown as failed in the wizard navigation.
   *
   * @defaultValue false
   */
  readonly failed = input(false, { transform: booleanAttribute });

  /** Emits when the user navigates forward from this step. */
  readonly next = output();
  /** Emits when the user navigates back from this step. */
  readonly back = output();
  /** Emits when the user completes the wizard from this step. */
  readonly save = output();

  /**
   * Whether this step is currently active or not.
   * @defaultValue false
   */
  readonly isActive = signal(false);
}
