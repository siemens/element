/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

export const pinningStyle: Part = createPart({
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
