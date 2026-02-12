/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { EnvironmentProviders, inject, Injector, Provider } from '@angular/core';
import { MissingTranslationHandler } from '@ngx-translate/core';
import { SiTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';

import { SiMissingTranslateService } from './si-missing-translate.service';
import { SiTranslateNgxTServiceBuilder } from './si-translate-ngxt.service-builder';

/**
 * This provider configures Element to use ngx-translate for translating {@link TranslatableString}
 * It should only be imported once in an application's configuration (typically `app.config.ts`)
 */
export const provideNgxTranslateForElement = (): (EnvironmentProviders | Provider)[] => {
  return [{ provide: SiTranslateServiceBuilder, useClass: SiTranslateNgxTServiceBuilder }];
};

/**
 * This provider configures default translations for ngx-translate, applying Element's built-in translations.
 *
 * @example
 * ```ts
 *   providers: [
 *     provideTranslateService({
 *       ...,
 *       missingTranslationHandler: provideMissingTranslationHandlerForElement(),
 *     }),
 *     provideNgxTranslateForElement(),
 *     ...
 *   ]
 * ```
 */
export const provideMissingTranslationHandlerForElement = (
  missingTranslationHandlerProvider?: Provider
): Provider => {
  return {
    provide: MissingTranslationHandler,
    useFactory: () => {
      if (!missingTranslationHandlerProvider) {
        return new SiMissingTranslateService();
      }
      const injector = Injector.create({
        providers: [missingTranslationHandlerProvider],
        parent: inject(Injector)
      });
      return new SiMissingTranslateService(injector.get(MissingTranslationHandler));
    }
  };
};
