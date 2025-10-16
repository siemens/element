/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';

import { scssMigrationRule } from './scss-migration-rule.js';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export const simplSiemensMigration = (_options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');
    const chainedRules = chain([
      schematic('migrate-ts-imports-to-siemens', _options),
      scssMigrationRule(_options)
    ]);
    return chainedRules(tree, context);
  };
};
