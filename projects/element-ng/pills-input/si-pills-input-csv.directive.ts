/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, input } from '@angular/core';

import { SiPillsInputPatternBase } from './si-pills-input-pattern-base';
import { SiPillsInputValueHandlerDirective } from './si-pills-input-value-handler';

@Directive({
  selector: '[siPillsInputCsv]',
  providers: [
    {
      provide: SiPillsInputValueHandlerDirective,
      useExisting: SiPillsInputCsvDirective
    }
  ]
})
export class SiPillsInputCsvDirective extends SiPillsInputPatternBase {
  /** @defaultValue undefined */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  override readonly validationRegex = input<RegExp>(undefined, { alias: 'pillsInputCsvItemRegex' });
}
