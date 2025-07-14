/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';

import { SiNoTranslateService } from './si-no-translate.service';
import { SiTranslateService } from './si-translate.service';
import { SiTranslateServiceBuilder } from './si-translate.service-builder';

/**
 * Always returns the same instance of {@link SiNoTranslateService}
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class SiNoTranslateServiceBuilder extends SiTranslateServiceBuilder {
  private siNoTranslateService = inject(SiNoTranslateService);

  override buildService(): SiTranslateService {
    return this.siNoTranslateService;
  }
}
