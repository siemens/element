/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a checkbox style part for the Element AG Grid theme.
 * This part overrides the unchecked checkbox hover state to match Element design system.
 *
 * @returns A part that defines checkbox styling for the Element AG Grid theme.
 */
export const elementCheckboxStyle: Part = createPart({
  css: `
.ag-checkbox-input-wrapper:not(.ag-checked):not(.ag-indeterminate):hover {
  border-color: var(--element-action-secondary-border-hover);
  background: var(--element-action-secondary-hover);
}
`
});
