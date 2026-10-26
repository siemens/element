/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

import type { SiAutoCollapsableListDirective } from './si-auto-collapsable-list.directive';

/** Provides the containing list without introducing circular directive imports. */
export const SI_AUTO_COLLAPSABLE_LIST = new InjectionToken<SiAutoCollapsableListDirective>(
  'SI_AUTO_COLLAPSABLE_LIST'
);
