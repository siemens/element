/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

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
 * Configuration for side panel navigation
 */
export interface SidePanelNavigateConfig {
  /** URL or route to navigate to when export icon is clicked */
  navigateUrl: string;
  /** Optional target for navigation (e.g., '_blank' for new tab) */
  target?: string;
}
