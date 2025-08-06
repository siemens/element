/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject } from '@angular/core';
import { TranslatableString } from '@spike-rabbit/element-translate-ng/translate-types';

import { globalScope } from './global.scope';
import { SiTranslatableService } from './si-translatable.service';

// an alternative implementation for $localize meant to be used for translation frameworks other than @angular/localize
const $localize = (strings: TemplateStringsArray, ...expressions: string[]): TranslatableString => {
  if (strings.length !== 1) {
    throw new Error(
      '$localize calls using @spike-rabbit/element-translate-ng do not support parameter interpolation'
    );
  }

  const firstPart = strings[0];
  const [, key, value] = /:.*?@@(.*?):(.*)/.exec(firstPart)!;

  return Zone.current.get('siResolveLocalize')(key, value);
};

const siResolveLocalize = (key: string, value: string): TranslatableString =>
  inject(SiTranslatableService).resolveText(key, value);

// Always register in the current zone. This is needed in MFE setups, where $localize is already patched.
(Zone.current as any)._properties.siResolveLocalize = siResolveLocalize;

// Patch $localize in the global scope if it was not already patched by ourselves or Angular.
// The default $localize function by Angular just throws an error.
try {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  globalScope.$localize`:@@si-localize:This is a test for $localize`;
} catch {
  globalScope.$localize = $localize;
}

/** @deprecated $localize is now automatically initialized. Drop all calls of this function. */
export const initSiLocalize = (): void => {};
