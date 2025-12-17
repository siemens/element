/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a toggle button style part for the Element AG Grid theme.
 * This part applies Element design system switch styling including hover states,
 * transitions, and proper knob positioning to match the Element switch component.
 */
export const toggleStyle: Part = createPart({
  css: `
    .ag-toggle-button-input-wrapper {
      transition: background-color 0.4s;
    }

    .ag-toggle-button-input-wrapper::before {
      transition: left 0.4s;
    }

    .ag-toggle-button-input-wrapper:not(.ag-checked):hover {
      background-color: var(--element-ui-4);
    }

    .ag-toggle-button-input-wrapper.ag-checked:hover {
      background-color: var(--element-ui-0-hover);
    }

    .ag-toggle-button-input-wrapper.ag-checked::before {
      background-color: var(--element-ui-5);
    }
  `
});
