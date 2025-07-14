/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injector, Provider } from '@angular/core';

import { SiTranslateService } from '../si-translate.service';
import { SiTranslateServiceBuilder } from '../si-translate.service-builder';

export const provideMockTranslateServiceBuilder = (
  buildService: (injector: Injector) => SiTranslateService
): Provider => ({
  provide: SiTranslateServiceBuilder,
  useValue: { buildService } as SiTranslateServiceBuilder
});
