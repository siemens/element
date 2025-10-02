/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { MigrationOptions } from './model';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export const siemensMigration = (_options: MigrationOptions): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');

    return tree;
  };
};
