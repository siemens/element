/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { getColorTokenRenameMigrationData } from '../migrations/data/index.js';
import { elementMigrationRule } from '../migrations/element-migration/element-migration.js';

export const migrateToV5101 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting color token rename for v51.0.1...');
    return elementMigrationRule({ path: '/' }, getColorTokenRenameMigrationData())(tree, context);
  };
};
