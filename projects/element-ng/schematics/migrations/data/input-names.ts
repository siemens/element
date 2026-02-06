/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface InputNamesInstruction {
  /** Regex to match module import path */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** HTML attribute selector */
  attributeSelector?: string;
  /** Array of input renames: [from, to] or [from, [to1, to2]] for splitting */
  apiMappings: { replace: string; replaceWith: string | string[] }[];
}

export const INPUT_NAMES_MIGRATION: InputNamesInstruction[] = [
  // v48 to v49
  {
    module: /@(siemens|simpl)\/element-ng/,
    elementSelector: 'si-filtered-search',
    apiMappings: [{ replace: 'readonly', replaceWith: 'disabled' }]
  },
  {
    module: /@(siemens|simpl)\/charts-ng/,
    elementSelector: 'si-chart-gauge',
    apiMappings: [
      { replace: 'numberOfDecimals', replaceWith: ['minNumberOfDecimals', 'maxNumberOfDecimals'] }
    ]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/(info-page|unauthorized-page))?/,
    elementSelector: 'si-unauthorized-page',
    apiMappings: [
      { replace: 'heading', replaceWith: 'titleText' },
      { replace: 'subHeading', replaceWith: 'copyText' },
      { replace: 'description', replaceWith: 'instructions' }
    ]
  }
];
