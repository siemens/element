/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';
import {
  SiSelectComplexOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

/**
 * This directive provides the si-select options and value strategy for the phone number input.
 * As we don't use si-select directly, we need to provide these strategies manually.
 */
@Directive({
  selector: '[siPhoneNumberInputSelect]',
  hostDirectives: [
    {
      directive: SiSelectComplexOptionsDirective,
      inputs: ['complexOptions', 'valueProvider']
    },
    { directive: SiSelectSingleValueDirective, inputs: ['value'], outputs: ['valueChange'] }
  ]
})
export class SiPhoneNumberInputSelectDirective {}
