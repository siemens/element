/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface SymbolRemovalInstruction {
  /** Module that the symbol was removed from. */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** HTML attribute selector */
  attributeSelector?: string;
  /** Names of the symbol being removed. */
  names: string[];
}

export const SYMBOL_REMOVALS_MIGRATION: SymbolRemovalInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-accordion',
    names: ['colorVariant']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'input',
    attributeSelector: 'siDateInput',
    names: ['dateInputDebounceTime']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'input',
    attributeSelector: 'siDatepicker',
    names: ['triggeringInput']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'si-date-range',
    names: ['debounceTime']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/filtered-search)?/,
    elementSelector: 'si-filtered-search',
    names: ['showIcon', 'noMatchingCriteriaText']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/form)?/,
    elementSelector: 'si-form-item',
    names: ['inputId', 'readonly']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/navbar-vertical)?/,
    elementSelector: 'si-navbar-vertical',
    names: ['autoCollapseDelay']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/split)?/,
    elementSelector: 'si-split-part',
    names: ['headerStatusColor', 'headerStatusIconClass']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/navbar-vertical)?/,
    elementSelector: 'si-tree-view',
    names: ['disableFilledIcons', 'trackByFunction']
  },
  {
    module: /@(siemens|simpl)\/charts-ng/,
    elementSelector: 'si-chart-gauge',
    names: ['numberOfDecimals']
  }
];
