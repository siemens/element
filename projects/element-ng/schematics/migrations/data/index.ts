/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { ATTRIBUTE_SELECTORS_MIGRATION } from './attribute-selectors.js';
import { COMPONENT_NAMES_MIGRATION } from './component-names.js';
import { ELEMENT_SELECTORS_MIGRATION } from './element-selectors.js';
import { INPUT_NAMES_MIGRATION } from './input-names.js';
import { OUTPUT_NAMES_MIGRATION } from './output-names.js';
import { PATTERN_REPLACEMENTS_MIGRATION } from './pattern-replacements.js';
import { SYMBOL_REMOVALS_MIGRATION } from './symbol-removals.js';

export type ElementMigrationData = {
  attributeSelectorChanges: typeof ATTRIBUTE_SELECTORS_MIGRATION;
  componentNameChanges: typeof COMPONENT_NAMES_MIGRATION;
  elementSelectorChanges: typeof ELEMENT_SELECTORS_MIGRATION;
  symbolRemovalChanges: typeof SYMBOL_REMOVALS_MIGRATION;
  outputNameChanges: typeof OUTPUT_NAMES_MIGRATION;
  inputNameChanges: typeof INPUT_NAMES_MIGRATION;
  patternReplacementsChanges: typeof PATTERN_REPLACEMENTS_MIGRATION;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getElementMigrationData = (): ElementMigrationData => ({
  attributeSelectorChanges: ATTRIBUTE_SELECTORS_MIGRATION,
  componentNameChanges: COMPONENT_NAMES_MIGRATION,
  elementSelectorChanges: ELEMENT_SELECTORS_MIGRATION,
  symbolRemovalChanges: SYMBOL_REMOVALS_MIGRATION,
  outputNameChanges: OUTPUT_NAMES_MIGRATION,
  inputNameChanges: INPUT_NAMES_MIGRATION,
  patternReplacementsChanges: PATTERN_REPLACEMENTS_MIGRATION
});

export type { ComponentNamesInstruction } from './component-names.js';
export type { AttributeSelectorInstruction } from './attribute-selectors.js';
export type { ElementSelectorInstruction } from './element-selectors.js';
export type { InputNamesInstruction } from './input-names.js';
export type { OutputNamesInstruction } from './output-names.js';
export type { PatternReplacementsInstruction } from './pattern-replacements.js';
export type { SymbolRemovalInstruction } from './symbol-removals.js';
