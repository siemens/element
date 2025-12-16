/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { CheckboxStyleParams, createPart, type Part } from 'ag-grid-community';

export const checkboxStyle: Part = createPart<CheckboxStyleParams>({
  feature: 'checkboxStyle',
  css: `
    .ag-checkbox-input-wrapper {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      inline-size: 16px !important;
      block-size: 16px !important;
      inset-block-start: 1px !important;
    }

    .ag-checkbox-input-wrapper input[type='checkbox'] {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      position: relative;
      display: block !important;
      inline-size: 16px !important;
      block-size: 16px !important;
      margin: 0 !important;
      border: 1px solid var(--element-ui-1) !important;
      border-radius: var(--element-button-radius) !important;
      background-color: var(--element-ui-5) !important;
      flex-shrink: 0;
      cursor: pointer;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:hover {
      border-color: var(--element-action-secondary-border-hover) !important;
      background-color: var(--element-action-secondary-hover) !important;
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
      background-color: var(--element-ui-0) !important;
      border-color: var(--element-ui-0) !important;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:checked:hover {
      background-color: var(--element-ui-0-hover) !important;
      border-color: var(--element-ui-0-hover) !important;
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:checked::after {
      background-color: var(--element-text-inverse);
      opacity: 1;
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

    .ag-checkbox-input-wrapper input[type='checkbox']:indeterminate:hover::after {
      background-color: var(--element-ui-0-hover);
    }

    .ag-checkbox-input-wrapper input[type='checkbox']:disabled {
      cursor: not-allowed;
      opacity: 0.5;
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
