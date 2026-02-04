/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface OutputNamesInstruction {
  /** Regex to match module import path */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** Array of API renames: [from, to] */
  apiMappings: { replace: string; replaceWith: string }[];
}

export const OUTPUT_NAMES_MIGRATION: OutputNamesInstruction[] = [
  // v47 to v48
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-collapsible-panel',
    apiMappings: [{ replace: 'toggle', replaceWith: 'panelToggle' }]
  },
  // v48 to v49
  {
    module: /@(siemens|simpl)\/element-ng(\/select)?/,
    elementSelector: 'si-select',
    apiMappings: [{ replace: 'dropdownClose', replaceWith: 'openChange' }]
  }
];
