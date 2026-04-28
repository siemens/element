/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { ElementMigrationData, getElementMigrationData } from '../migrations/data/index.js';
import { elementMigrationRule } from '../migrations/element-migration/element-migration.js';
import { iconPathMigrationRule } from '../migrations/icon-path-migration/index.js';
import { missingTranslateMigrationRule } from '../migrations/ngx-translate/index.js';

export const migrateToV49 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 48 to 49...');
    const migrationData: ElementMigrationData = getElementMigrationData();
    const options = { path: '/' };
    return chain([
      elementMigrationRule(options, migrationData),
      missingTranslateMigrationRule(options),
      iconPathMigrationRule(options)
    ])(tree, context);
  };
};
