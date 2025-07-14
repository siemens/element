/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injector } from '@angular/core';

import { SiNoTranslateServiceBuilder } from './si-no-translate.service-builder';
import { SiTranslateService } from './si-translate.service';
import { SiTranslateServiceBuilder } from './si-translate.service-builder';

export const injectSiTranslateService = (): SiTranslateService =>
  /* This is needed for ngx-translate when using the isolated mode for lazy child routes.
   * In that case, a new TranslateService is created by ngx-translate which also needs to be used
   * by Element components within that route.
   * The Builder can be used to check if a new service is available
   * and then provide a corresponding SiTranslateService.
   */
  (
    inject(SiTranslateServiceBuilder, { optional: true }) ?? inject(SiNoTranslateServiceBuilder)
  ).buildService(inject(Injector));
