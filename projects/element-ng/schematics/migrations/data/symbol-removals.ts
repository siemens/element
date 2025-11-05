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
  /** Component or Module class name to check for import */
  componentOrModuleName: string | string[];
  /** Names of the symbol being removed. */
  names: string[];
}

export const SYMBOL_REMOVALS_MIGRATION: SymbolRemovalInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-accordion',
    componentOrModuleName: ['SiAccordionComponent', 'SiAccordionModule'],
    names: ['colorVariant']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'input',
    attributeSelector: 'siDateInput',
    componentOrModuleName: ['SiDateInputDirective', 'SiDatepickerModule'],
    names: ['dateInputDebounceTime']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'input',
    attributeSelector: 'siDatepicker',
    componentOrModuleName: ['SiDateInputDirective', 'SiDatepickerModule'],
    names: ['triggeringInput']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'si-date-range',
    componentOrModuleName: ['SiDateRangeComponent', 'SiDatepickerModule'],
    names: ['debounceTime']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/filtered-search)?/,
    elementSelector: 'si-filtered-search',
    componentOrModuleName: ['SiFilteredSearchComponent', 'SiFilteredSearchModule'],
    names: ['showIcon', 'noMatchingCriteriaText']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/form)?/,
    elementSelector: 'si-form-item',
    componentOrModuleName: ['SiFormItemComponent', 'SiFormModule'],
    names: ['inputId', 'readonly']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/navbar-vertical)?/,
    elementSelector: 'si-navbar-vertical',
    componentOrModuleName: ['SiNavbarVerticalComponent', 'SiNavbarVerticalModule'],
    names: ['autoCollapseDelay']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/split)?/,
    elementSelector: 'si-split-part',
    componentOrModuleName: ['SiSplitPartComponent', 'SiSplitModule'],
    names: ['headerStatusColor', 'headerStatusIconClass']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/navbar-vertical)?/,
    elementSelector: 'si-tree-view',
    componentOrModuleName: ['SiTreeViewComponent', 'SiTreeViewModule'],
    names: ['disableFilledIcons', 'trackByFunction']
  }
];
