/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { ATTRIBUTE_SELECTORS_MIGRATION } from './attribute-selectors.js';
import { COMPONENT_NAMES_MIGRATION } from './component-names.js';
import { ELEMENT_SELECTORS_MIGRATION } from './element-selectors.js';
import { OUTPUT_NAMES_MIGRATION } from './output-names.js';
import { SYMBOL_REMOVALS_MIGRATION } from './symbol-removals.js';

export type ElementMigrationData = {
  attributeSelectorChanges: typeof ATTRIBUTE_SELECTORS_MIGRATION;
  componentNameChanges: typeof COMPONENT_NAMES_MIGRATION;
  elementSelectorChanges: typeof ELEMENT_SELECTORS_MIGRATION;
  symbolRemovalChanges: typeof SYMBOL_REMOVALS_MIGRATION;
  outputNameChanges: typeof OUTPUT_NAMES_MIGRATION;
};

export const getElementMigrationData = (): ElementMigrationData => ({
  attributeSelectorChanges: ATTRIBUTE_SELECTORS_MIGRATION,
  componentNameChanges: COMPONENT_NAMES_MIGRATION,
  elementSelectorChanges: ELEMENT_SELECTORS_MIGRATION,
  symbolRemovalChanges: SYMBOL_REMOVALS_MIGRATION,
  outputNameChanges: OUTPUT_NAMES_MIGRATION
});

export type { ComponentNamesInstruction } from './component-names.js';
export type { AttributeSelectorInstruction } from './attribute-selectors.js';
export type { ElementSelectorInstruction } from './element-selectors.js';
export type { OutputNamesInstruction } from './output-names.js';
export type { SymbolRemovalInstruction } from './symbol-removals.js';
