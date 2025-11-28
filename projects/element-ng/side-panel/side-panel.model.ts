/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { NavigationExtras } from '@angular/router';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Side panel mode options.
 * - scroll: pushes content when side panel opens/closes,
 * - over: Opens as an overlay on existing content. Just like modal.
 */
export type SidePanelMode = 'scroll' | 'over';

/**
 * Side panel size options.
 * - regular: 390px,
 * - wide: 500px,
 * - extended: responsive width that adapts to screen size. Full width on small/medium screens,
 *   scales from 480px to 912px (max) on larger screens for optimal content display
 */
export type SidePanelSize = 'regular' | 'wide' | 'extended';

/**
 * Side panel display mode options.
 * - navigate: allows navigation to dedicated page
 * - overlay: allows full-screen overlay toggle
 */
export type SidePanelDisplayMode = 'navigate' | 'overlay';

/**
 *  Interface representing a router link item in the side panel.
 */
export interface SidePanelNavigateRouterLink {
  type: 'router-link';
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** Link for the angular router. Accepts the same values as {@link RouterLink}. */
  routerLink: string | any[];
  /** Navigation extras that are passed to the {@link RouterLink}. */
  extras?: NavigationExtras;
}

/**
 * Interface representing a link item in the side panel.
 */
export interface SidePanelNavigateLink {
  type: 'link';
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** The href property of the anchor. */
  href: string;
  /** The target property of the anchor. */
  target?: string;
}

/**
 * Configuration for side panel navigation.
 */
export type SidePanelNavigateConfig = SidePanelNavigateRouterLink | SidePanelNavigateLink;
