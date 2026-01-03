/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a text filter style part for the Element AG Grid theme.
 * This part applies Element design system styling to text filter search inputs,
 * including border width and background color customization.
 *
 * @returns A part that defines text filter search input styling for the Element AG Grid theme.
 */
export const elementTextFilterStyle: Part = createPart({
  css: `
  .ag-column-select-header-filter-wrapper,
.ag-filter-toolpanel-search,
.ag-mini-filter,
.ag-filter-filter,
.ag-filter-add-select {
  .ag-text-field-input[type='text'] {
    border-width: 0;
    background-color: var(--element-base-4);
  }
}
`
});
