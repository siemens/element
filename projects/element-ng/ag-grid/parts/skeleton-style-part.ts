/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

export const skeletonStyle: Part = createPart({
  css: `
    .ag-skeleton-effect {
    --ag-row-loading-skeleton-effect-color: var(--element-ui-3);
    }
  `
});
