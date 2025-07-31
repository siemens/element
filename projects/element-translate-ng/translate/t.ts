/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

import { globalScope } from './global.scope';
import { SiTranslatableService } from './si-translatable.service';
import { injectSiTranslateService } from './si-translate.inject';

// an alternative implementation for $localize meant to be used for translation frameworks other than @angular/localize
const $localize = (strings: TemplateStringsArray, ...expressions: string[]): TranslatableString => {
  if (strings.length !== 1) {
    throw new Error(
      '$localize calls using @siemens/element-translate-ng do not support parameter interpolation'
    );
  }

  return strings[0];
};

/**
 * Always wrap `$localize` calls in this function within element components.
 * It may patch the global $localize based on the current translation framework.
 *
 * This function requires an `InjectionContext.`
 *
 * @internal
 *
 * @example
 * ```ts
 * class MyComponent {
 *   readonly myText = t(() => $localize`:@@my-text:This is a default text`);
 * }
 * ```
 */
export const t = (localizeWrapperFunction: () => TranslatableString): string => {
  let localizeString: string;
  if (injectSiTranslateService().prevent$LocalizeInit) {
    localizeString = localizeWrapperFunction();
  } else {
    const $localizeBackup = globalScope.$localize;
    globalScope.$localize = $localize;
    localizeString = localizeWrapperFunction();
    globalScope.$localize = $localizeBackup;
  }

  const [, key, value] = /:.*?@@(.*?):(.*)/.exec(localizeString)!;
  return inject(SiTranslatableService).resolveText(key, value);
};
