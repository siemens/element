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
