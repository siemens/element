/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { migrateSearchBar } from '../migrate-search-bar/index.js';

export const migrateToV52 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 51 to 52...');
    return chain([migrateSearchBar({ path: '/', typeaheadOnly: true })])(tree, context);
  };
};
