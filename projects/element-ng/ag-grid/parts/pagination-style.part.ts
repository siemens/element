/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a pagination style part for the Element AG Grid theme.
 * This part applies font weight styling to pagination summary numbers.
 *
 * @returns A part that defines pagination styling for the Element AG Grid theme.
 */
export const paginationStyle: Part = createPart({
  css: `
    .ag-paging-row-summary-panel-number {
      font-weight: 600;
    }
  `
});
