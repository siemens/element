/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';
import { SI_TRANSLATABLE_VALUES } from '@siemens/element-translate-ng/translate';

import { SiTranslatableKeys } from './si-translatable-keys.interface';

export const provideSiDashboardsTranslatableOverrides: (
  values: SiTranslatableKeys
) => Provider = values => ({
  useValue: values,
  multi: true,
  provide: SI_TRANSLATABLE_VALUES
});
