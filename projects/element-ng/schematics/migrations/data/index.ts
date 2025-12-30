/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { ATTRIBUTE_SELECTORS_MIGRATION } from './attribute-selectors.js';
import { COMPONENT_NAMES_MIGRATION } from './component-names.js';
import { ELEMENT_SELECTORS_MIGRATION } from './element-selectors.js';
import { IMPORT_REMOVALS_MIGRATION } from './import-removals.js';
import { OUTPUT_NAMES_MIGRATION } from './output-names.js';
import { SYMBOL_REMOVALS_MIGRATION } from './symbol-removals.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getElementMigrationData = () => ({
  attributeSelectorChanges: ATTRIBUTE_SELECTORS_MIGRATION,
  componentNameChanges: COMPONENT_NAMES_MIGRATION,
  elementSelectorChanges: ELEMENT_SELECTORS_MIGRATION,
  symbolRemovalChanges: SYMBOL_REMOVALS_MIGRATION,
  outputNameChanges: OUTPUT_NAMES_MIGRATION,
  importRemovalChanges: IMPORT_REMOVALS_MIGRATION
});
