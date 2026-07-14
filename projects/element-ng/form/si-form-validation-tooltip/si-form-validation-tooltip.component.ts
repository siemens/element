/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiFormError } from '../si-form-item/si-form-item.component';

@Component({
  selector: 'si-form-validation-tooltip',
  imports: [SiTranslatePipe],
  template: `
    @for (error of errors(); track error.key) {
      <div>{{ error.message | translate: error.params }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'd-flex flex-column gap-2 text-start'
  }
})
export class SiFormValidationTooltipComponent {
  /**
   * The validation errors to display.
   *
   * @defaultValue []
   */
  readonly errors = input<SiFormError[]>([]);
}
