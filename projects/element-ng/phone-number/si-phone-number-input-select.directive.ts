/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';
import {
  SiCustomSelectDirective,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

/**
 * Composes custom-select behavior with the options and value strategies for country selection.
 */
@Directive({
  selector: '[siPhoneNumberInputSelect]',
  hostDirectives: [
    {
      directive: SiCustomSelectDirective,
      inputs: [
        'id',
        'disabled',
        'readonly',
        'labelledby',
        'errormessageId',
        'siCustomSelectScrollStrategy: scrollStrategy'
      ],
      outputs: ['openChange']
    },
    {
      directive: SiSelectSimpleOptionsDirective,
      inputs: ['options']
    },
    { directive: SiSelectSingleValueDirective, inputs: ['value'], outputs: ['valueChange'] }
  ]
})
export class SiPhoneNumberInputSelectDirective {}
