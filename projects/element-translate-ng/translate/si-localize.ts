/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { inject } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

import { globalScope } from './global.scope';
import { SiTranslatableService } from './si-translatable.service';

// an alternative implementation for $localize meant to be used for translation frameworks other than @angular/localize
const $localize = (strings: TemplateStringsArray, ...expressions: string[]): TranslatableString => {
  if (strings.length !== 1) {
    throw new Error(
      '$localize calls using @siemens/element-translate-ng do not support parameter interpolation'
    );
  }

  const firstPart = strings[0];
  const [, key, value] = /:.*?@@(.*?):(.*)/.exec(firstPart)!;

  return Zone.current.get('siResolveLocalize')(key, value);
};

const siResolveLocalize = (key: string, value: string): TranslatableString =>
  inject(SiTranslatableService).resolveText(key, value);

/**
 * Initializes the Element version of $localize. Can be called multiple times.
 */
export const initSiLocalize = (): void => {
  (Zone.current as any)._properties.siResolveLocalize = siResolveLocalize;
  globalScope.$localize = $localize;
};

// Init $localize in the current zone
try {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  globalScope.$localize`:@@si-localize:This is a test for $localize`;
} catch {
  initSiLocalize();
}
