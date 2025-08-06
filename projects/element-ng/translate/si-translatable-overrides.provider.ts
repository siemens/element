/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';
import { SI_TRANSLATABLE_VALUES } from '@spike-rabbit/element-translate-ng/translate';

import { SiTranslatableKeys } from './si-translatable-keys.interface';

export const provideSiTranslatableOverrides: (values: SiTranslatableKeys) => Provider = values => ({
  useValue: values,
  multi: true,
  provide: SI_TRANSLATABLE_VALUES
});
