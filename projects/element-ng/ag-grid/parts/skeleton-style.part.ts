/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a skeleton style part for the Element AG Grid theme.
 * This part applies Element design system colors to skeleton loading effects.
 *
 * @returns A part that defines skeleton loading styles for the Element AG Grid theme.
 */
export const skeletonStyle: Part = createPart({
  css: `
    .ag-skeleton-effect {
    --ag-row-loading-skeleton-effect-color: var(--element-ui-3);
    }
  `
});
