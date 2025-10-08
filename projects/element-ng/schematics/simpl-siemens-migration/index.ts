/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { importMigrationRule } from './ts-import-migration-rule.js';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export const simplSiemensMigration = (_options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');
    const chainedRules = chain([importMigrationRule(_options)]);
    return chainedRules(tree, context);
  };
};
