/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

import { globalScope } from './global.scope';

// an alternative implementation for $localize meant to be used for translation frameworks other than @angular/localize
const $localize = (strings: TemplateStringsArray, ...expressions: string[]): TranslatableString => {
  if (strings.length !== 1) {
    throw new Error(
      '$localize calls using @siemens/element-translate-ng do not support parameter interpolation'
    );
  }

  // No zone.js loaded (zoneless).
  // We can assume that this is the new style of $localize call, which just gets a plain string.
  if (!('Zone' in globalScope)) {
    return strings[0];
  }

  if (Zone.current.get('siResolveLocalizeNew')) {
    // This is the new style of $localize call, which just gets a plain string.
    return Zone.current.get('siResolveLocalize')(strings[0]);
  } else {
    // Seems like this was provided by an older version of @siemens/element-ng.
    // So we need to parse the string here already and call it with the key and value.
    const [, key, value] = /:.*?@@(.*?):(.*)/.exec(strings[0])!;
    return Zone.current.get('siResolveLocalize')(key, value);
  }
};

const siResolveLocalize = (key: string, value?: string): TranslatableString => {
  if (value) {
    // This is the old style of $localize call, which has a key and a value.
    // It is called with two params, if an older version of @siemens/element-ng patched the global scope.
    return `:@@${key}:${value}`;
  } else {
    return key;
  }
};

// If no zone.js is loaded, we cannot set any properties.
// So the app must use the new $localize implementation.
// As with the older version, we did not support zoneless.
if ('Zone' in globalScope) {
  // Always register in the current zone. This is needed in MFE setups, where $localize is already patched.
  (Zone.current as any)._properties.siResolveLocalize = siResolveLocalize;
  // Flag this as the new implementation of $localize, so that we can distinguish it from the old one.
  (Zone.current as any)._properties.siResolveLocalizeNew = true;
}

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
