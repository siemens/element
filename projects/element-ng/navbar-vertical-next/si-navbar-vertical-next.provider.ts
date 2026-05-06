/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

import type { SiNavbarVerticalNextComponent } from './si-navbar-vertical-next.component';

/** @experimental */
export const SI_NAVBAR_VERTICAL_NEXT = new InjectionToken<SiNavbarVerticalNextComponent>(
  'SI_NAVBAR_VERTICAL_NEXT'
);

/** @experimental */
/** @internal Provides the label text of the navbar item hosting the group trigger. */
export const SI_NAVBAR_ITEM_LABEL = new InjectionToken<() => string>('SI_NAVBAR_ITEM_LABEL');
