/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

export const checkboxStyle: Part = createPart({
  feature: 'checkboxStyle',
  css: `
    .ag-checkbox-input-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 16px;
      block-size: 16px;
      inset-block-start: 1px;
    }

    .ag-checkbox-input-wrapper input[type='checkbox'] {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      position: relative;
      display: block;
      inline-size: 16px;
      block-size: 16px;
      margin: 0;
      border: 1px solid var(--element-ui-1);
      border-radius: var(--element-button-radius);
      background-color: var(--element-ui-5);
      flex-shrink: 0;
      cursor: pointer;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:hover {
      border-color: var(--element-action-secondary-border-hover);
      background: var(--element-action-secondary-hover);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']::after {
      content: '';
      position: absolute;
      display: block;
      inset-inline-start: -1px;
      inset-block-start: -1px;
      inline-size: 16px;
      block-size: 16px;
      mask-image: url("data:image/svg+xml;base64,PHN2ZyBpZD0iSWNvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+CiAgPHRpdGxlPm9rPC90aXRsZT4KICA8cGF0aCBkPSJNMzc5LjUxLDE1Ni43NmwtMTczLDE3My03NC03NGExMiwxMiwwLDEsMC0xNywxN2w4Mi41LDgyLjVhMTIsMTIsMCwwLDAsMTcsMGwxODEuNS0xODEuNWExMiwxMiwwLDAsMC0xNy0xN1oiLz4KPC9zdmc+Cg==");
      opacity: 0;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:checked {
      background-color: var(--element-ui-0);
      border-color: var(--element-ui-0);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:checked:hover {
      background-color: var(--element-ui-0-hover);
      border-color: var(--element-ui-0-hover);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:checked::after {
      background-color: var(--element-text-inverse);
      opacity: 1;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate {
      border-color: var(--element-ui-0);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate::after {
      mask-image: none;
      background-color: var(--element-ui-0);
      inline-size: 10px;
      block-size: 2px;
      opacity: 1;
      inset-inline-start: 2px;
      inset-block-start: 6px;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate:hover {
      border-color: var(--element-ui-0-hover);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate:hover::after {
      background-color: var(--element-ui-0-hover);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:disabled {
      cursor: not-allowed;
      border-color: var(--element-ui-3);
      background-color: var(--element-ui-5);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:checked:disabled {
      background-color: var(--element-ui-3);
      border-color: var(--element-ui-3);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate:disabled {
      border-color: var(--element-ui-3);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate:disabled::after {
      background-color: var(--element-ui-3);
    }
  `
});
