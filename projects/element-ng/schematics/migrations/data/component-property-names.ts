/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface ComponentPropertyNamesInstruction {
  /** Regex to match module import path */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** HTML attribute selector */
  attributeSelector?: string;
  /** Array of property renames: [from, to] or [from, [to1, to2]] for splitting */
  propertyMappings: { replace: string; replaceWith: string | string[] }[];
}

export const COMPONENT_PROPERTY_NAMES_MIGRATION: ComponentPropertyNamesInstruction[] = [
  // Input name changes
  // v48 to v49
  {
    module: /@(siemens|simpl)\/element-ng/,
    elementSelector: 'si-filtered-search',
    propertyMappings: [{ replace: 'readonly', replaceWith: 'disabled' }]
  },
  {
    module: /@(siemens|simpl)\/charts-ng/,
    elementSelector: 'si-chart-gauge',
    propertyMappings: [
      { replace: 'numberOfDecimals', replaceWith: ['minNumberOfDecimals', 'maxNumberOfDecimals'] }
    ]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/(info-page|unauthorized-page))?/,
    elementSelector: 'si-unauthorized-page',
    propertyMappings: [
      { replace: 'heading', replaceWith: 'titleText' },
      { replace: 'subHeading', replaceWith: 'copyText' },
      { replace: 'description', replaceWith: 'instructions' }
    ]
  }
];
