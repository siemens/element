/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { ElementMigrationData, getElementMigrationData } from '../migrations/data/index.js';
import { elementMigrationRule } from '../migrations/element-migration/element-migration.js';

export const migrateToV51 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 50 to 51...');
    const migrationData: ElementMigrationData = getElementMigrationData();
    const options = { path: '/' };
    return chain([elementMigrationRule(options, migrationData)])(tree, context);
  };
};
