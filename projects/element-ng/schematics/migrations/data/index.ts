/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { ATTRIBUTE_SELECTORS_MIGRATION } from './attribute-selectors.js';
import { CLASS_MEMBER_REPLACEMENTS_MIGRATION } from './class-member-replacement.js';
import { COMPONENT_NAMES_MIGRATION } from './component-names.js';
import { ELEMENT_SELECTORS_MIGRATION } from './element-selectors.js';
import { OUTPUT_NAMES_MIGRATION } from './output-names.js';
import { SYMBOL_REMOVALS_MIGRATION } from './symbol-removals.js';

export type ElementMigrationData = {
  attributeSelectorChanges: typeof ATTRIBUTE_SELECTORS_MIGRATION;
  classMemberReplacementChanges: typeof CLASS_MEMBER_REPLACEMENTS_MIGRATION;
  componentNameChanges: typeof COMPONENT_NAMES_MIGRATION;
  elementSelectorChanges: typeof ELEMENT_SELECTORS_MIGRATION;
  outputNameChanges: typeof OUTPUT_NAMES_MIGRATION;
  symbolRemovalChanges: typeof SYMBOL_REMOVALS_MIGRATION;
};

export const getElementMigrationData = (): ElementMigrationData => ({
  attributeSelectorChanges: ATTRIBUTE_SELECTORS_MIGRATION,
  classMemberReplacementChanges: CLASS_MEMBER_REPLACEMENTS_MIGRATION,
  componentNameChanges: COMPONENT_NAMES_MIGRATION,
  elementSelectorChanges: ELEMENT_SELECTORS_MIGRATION,
  outputNameChanges: OUTPUT_NAMES_MIGRATION,
  symbolRemovalChanges: SYMBOL_REMOVALS_MIGRATION
});

export type { AttributeSelectorInstruction } from './attribute-selectors.js';
export type { ClassMemberReplacementInstruction } from './class-member-replacement.js';
export type { ComponentNamesInstruction } from './component-names.js';
export type { ElementSelectorInstruction } from './element-selectors.js';
export type { OutputNamesInstruction } from './output-names.js';
export type { SymbolRemovalInstruction } from './symbol-removals.js';
