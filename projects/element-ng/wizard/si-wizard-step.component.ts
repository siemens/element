/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';

@Component({
  selector: 'si-wizard-step',
  templateUrl: './si-wizard-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiWizardStepComponent {
  /** @defaultValue '' */
  readonly heading = input('');
  /** @defaultValue true */
  readonly isValid = input(true, { transform: booleanAttribute });
  /** @defaultValue true */
  readonly isNextNavigable = input(true, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly failed = input(false, { transform: booleanAttribute });

  readonly next = output();
  readonly back = output();
  readonly save = output();

  /**
   * Whether this step is currently active or not.
   * @defaultValue false
   */
  readonly isActive = signal(false);
}
