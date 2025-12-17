/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

export const checkboxStyle: Part = createPart({
  css: `
  .ag-checkbox-input-wrapper:focus-within {
  box-shadow: none;
  outline: none;
}

.ag-checkbox-input-wrapper:not(.ag-checked):not(.ag-indeterminate):hover {
  border-color: var(--element-action-secondary-border-hover);
  background: var(--element-action-secondary-hover);
}
`
});
