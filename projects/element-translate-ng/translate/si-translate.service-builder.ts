/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable, Injector } from '@angular/core';

import { SiTranslateService } from './si-translate.service';

/**
 * Provide this class to build a custom translation service.
 *
 * @internal
 */
@Injectable()
export abstract class SiTranslateServiceBuilder {
  /**
   * Returns a translation service instance.
   * @param injector - Is used to retrieve dependencies needed to create the translation service.
   */
  abstract buildService(injector: Injector): SiTranslateService;
}
