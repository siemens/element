/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a pinning style part for the Element AG Grid theme.
 * This part applies box shadow styling to floating top and bottom rows.
 *
 * @returns A part that defines pinning styles for the Element AG Grid theme.
 */
export const elementPinningStyle: Part = createPart({
  css: `
  .ag-floating-top {
    box-shadow:
      0 0 8px var(--element-box-shadow-color-1),
      0 8px 8px var(--element-box-shadow-color-2);
    z-index: 1;
    position: relative;
  }

  .ag-floating-bottom {
    box-shadow:
      0 0 8px var(--element-box-shadow-color-1),
      0 -8px 8px var(--element-box-shadow-color-2);
    z-index: 1;
    position: relative;
  }
`
});
