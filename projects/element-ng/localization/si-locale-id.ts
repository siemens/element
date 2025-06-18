/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';

import { SiLocaleService } from './si-locale.service';

/**
 * The SiLocaleId is used to provide a locale id from the translate service
 * to the angular localization. The Angular services call toString or valueOf
 * so that the current locale of the translation service is provided. The Intl.
 * library does not invoke toString() and using the value directly in Intl
 * formatting results always having the `en` locale. Thus, when using the SiLocaleId
 * in other services, make sure to use the `toString()` method before.
 */
@Injectable()
export class SiLocaleId extends String {
  protected service: SiLocaleService;

  // the constructor is needed for unknown reasons. w/o the inject() fails
  constructor() {
    super();
    this.service = inject(SiLocaleService);
  }

  /**
   * Outputs the locale id as a string.
   */
  override toString(): string {
    return this.service.locale === 'template' ? 'en' : this.service.locale;
  }

  override valueOf(): string {
    return this.toString();
  }

  override toLowerCase(): string {
    return this.toString().toLowerCase();
  }
}
