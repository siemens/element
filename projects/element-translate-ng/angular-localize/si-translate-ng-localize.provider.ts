/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { EnvironmentProviders, Provider } from '@angular/core';
import { SiTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';

import { SiTranslateNgLocalizeServiceBuilder } from './si-translate-ng-localize-service-builder.service';

/**
 * This provider configures Element to work with \@angular/localize.
 * It should only be imported once in an application's configuration (typically `app.config.ts`)
 */
export const provideNgLocalizeForElement = (): (EnvironmentProviders | Provider)[] => {
  return [{ provide: SiTranslateServiceBuilder, useClass: SiTranslateNgLocalizeServiceBuilder }];
};
