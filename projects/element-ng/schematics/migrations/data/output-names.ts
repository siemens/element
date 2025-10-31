/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface OutputNamesInstruction {
  /** Regex to match module import path */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** Component class name to check for import */
  componentName: string;
  /** Array of API renames: [from, to] */
  apiMappings: { replace: string; replaceWith: string }[];
}

export const OUTPUT_NAMES_MIGRATION: OutputNamesInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-collapsible-panel',
    componentName: 'SiCollapsiblePanelComponent',
    apiMappings: [{ replace: '(toggle)', replaceWith: '(panelToggle)' }]
  }
];
