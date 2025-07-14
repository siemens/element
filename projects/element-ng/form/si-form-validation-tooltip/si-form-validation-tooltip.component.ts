/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, InjectionToken, Signal } from '@angular/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiFormError } from '../si-form-item/si-form-item.component';

export const SI_FORM_VALIDATION_TOOLTIP_DATA = new InjectionToken<Signal<SiFormError[]>>(
  'SiFormValidationTooltipData'
);

@Component({
  selector: 'si-form-validation-tooltip',
  imports: [SiTranslateModule],
  template: `
    @for (error of errors(); track error.key) {
      <div>{{ error.message | translate: error.params }}</div>
    }
  `,
  host: {
    'class': 'd-flex flex-column gap-2'
  }
})
export class SiFormValidationTooltipComponent {
  protected errors = inject(SI_FORM_VALIDATION_TOOLTIP_DATA);
}
