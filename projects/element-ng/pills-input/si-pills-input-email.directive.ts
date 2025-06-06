/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, signal } from '@angular/core';

import { SiPillsInputPatternBase } from './si-pills-input-pattern-base';
import { SiPillsInputValueHandlerDirective } from './si-pills-input-value-handler';

// From Angular Email Validator
const EMAIL_REGEX =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;

@Directive({
  selector: '[siPillsInputEmail]',
  providers: [
    {
      provide: SiPillsInputValueHandlerDirective,
      useExisting: SiPillsInputEmailDirective
    }
  ]
})
export class SiPillsInputEmailDirective extends SiPillsInputPatternBase {
  /**
   * @defaultValue signal(EMAIL_REGEX).asReadonly()
   */
  override readonly validationRegex = signal(EMAIL_REGEX).asReadonly();
}
