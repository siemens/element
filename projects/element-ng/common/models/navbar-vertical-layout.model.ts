/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal } from '@angular/core';

/**
 * Layout state shared with components alongside a vertical navbar.
 * @internal
 */
export interface SiNavbarVerticalLayout {
  readonly collapsed: Signal<boolean>;
  readonly visible: Signal<boolean>;
  readonly textOnly: Signal<boolean>;
}

/**
 * Injection token for the layout state of a vertical navbar instance.
 * @internal
 */
export const SI_NAVBAR_VERTICAL_LAYOUT = new InjectionToken<SiNavbarVerticalLayout>(
  'SI_NAVBAR_VERTICAL_LAYOUT'
);
