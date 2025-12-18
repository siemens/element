/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

export const paginationStyle: Part = createPart({
  css: `
    .ag-paging-row-summary-panel-number {
      font-weight: 600;
    }
  `
});
