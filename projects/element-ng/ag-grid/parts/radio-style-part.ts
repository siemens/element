/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a radio button style part for the Element AG Grid theme.
 * This part applies Element design system styling to radio buttons including colors,
 * hover states, checked states, and disabled states.
 */
export const radioStyle: Part = createPart({
  css: `
  .ag-radio-button-input-wrapper {
  background-color: var(--element-ui-5);
  border: 1px solid var(--element-ui-1);
}

.ag-radio-button-input-wrapper:hover {
  border-color: var(--element-action-secondary-border-hover);
  background: var(--element-action-secondary-hover);
}

.ag-radio-button-input-wrapper.ag-checked {
  border-color: var(--element-ui-0);
  background-color: var(--element-ui-5);
}

.ag-radio-button-input-wrapper.ag-checked::after {
  background-color: var(--element-ui-0);
  mask-image: none;
  inset: 4px;
  border-radius: 50%;
}

.ag-radio-button-input-wrapper.ag-checked:hover {
  border-color: var(--element-ui-0-hover);
}

.ag-radio-button-input-wrapper.ag-checked:hover::after {
  background-color: var(--element-ui-0-hover);
}

.ag-radio-button-input-wrapper.ag-disabled {
  border-color: var(--element-ui-3);
  background-color: var(--element-ui-5);
  opacity: 1;
}

.ag-radio-button-input-wrapper.ag-checked.ag-disabled {
  border-color: var(--element-ui-3);
}

.ag-radio-button-input-wrapper.ag-checked.ag-disabled::after {
  background-color: var(--element-ui-3);
}
`
});
