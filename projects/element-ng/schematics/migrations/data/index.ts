/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { ATTRIBUTE_SELECTORS_MIGRATION } from './attribute-selectors.js';
import { CLASS_MEMBER_REPLACEMENTS_MIGRATION } from './class-member-replacement.js';
import { COMPONENT_PROPERTY_NAMES_MIGRATION } from './component-property-names.js';
import { ELEMENT_SELECTORS_MIGRATION } from './element-selectors.js';
import { SYMBOL_REMOVALS_MIGRATION } from './symbol-removals.js';
import { SYMBOL_RENAMING_MIGRATION } from './symbol-renaming.js';

export type ElementMigrationData = {
  attributeSelectorChanges: typeof ATTRIBUTE_SELECTORS_MIGRATION;
  classMemberReplacementChanges: typeof CLASS_MEMBER_REPLACEMENTS_MIGRATION;
  componentPropertyNameChanges: typeof COMPONENT_PROPERTY_NAMES_MIGRATION;
  elementSelectorChanges: typeof ELEMENT_SELECTORS_MIGRATION;
  symbolRemovalChanges: typeof SYMBOL_REMOVALS_MIGRATION;
  symbolRenamingChanges: typeof SYMBOL_RENAMING_MIGRATION;
};

export const getElementMigrationData = (): ElementMigrationData => ({
  attributeSelectorChanges: ATTRIBUTE_SELECTORS_MIGRATION,
  classMemberReplacementChanges: CLASS_MEMBER_REPLACEMENTS_MIGRATION,
  componentPropertyNameChanges: COMPONENT_PROPERTY_NAMES_MIGRATION,
  elementSelectorChanges: ELEMENT_SELECTORS_MIGRATION,
  symbolRemovalChanges: SYMBOL_REMOVALS_MIGRATION,
  symbolRenamingChanges: SYMBOL_RENAMING_MIGRATION
});

export type { AttributeSelectorInstruction } from './attribute-selectors.js';
export type { ClassMemberReplacementInstruction } from './class-member-replacement.js';
export type { ComponentPropertyNamesInstruction } from './component-property-names.js';
export type { ElementSelectorInstruction } from './element-selectors.js';
export type { SymbolRemovalInstruction } from './symbol-removals.js';
export type { SymbolRenamingInstruction } from './symbol-renaming.js';
