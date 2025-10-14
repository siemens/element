/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { iconMigrationRule } from './icon-migration.js';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export const initialMigration = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Initial Migration...');
    const chainedRules = chain([iconMigrationRule()]);
    return chainedRules(tree, context);
  };
};
