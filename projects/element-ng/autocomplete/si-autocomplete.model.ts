/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';

export const AUTOCOMPLETE_LISTBOX = new InjectionToken<SiAutocompleteListboxDirective<unknown>>(
  'si-autocomplete-listbox'
);
