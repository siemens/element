/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, SchematicContext, Rule, chain } from '@angular-devkit/schematics';

import { ElementMigrationData, getElementMigrationData } from './data/index.js';
import { elementMigrationRule } from './element-migration/index.js';
import { iconPathMigrationRule } from './icon-path-migration/index.js';
import { missingTranslateMigrationRule } from './ngx-translate/index.js';

export const v47to48Migration = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting migration from v47 to v48...');
    const migrationData: ElementMigrationData = getElementMigrationData();
    return chain([
      elementMigrationRule({ ...options }, migrationData)
    ])(tree, context);
  };
};
export const v48to49Migration = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting migration from v48 to v49...');
    const migrationData: ElementMigrationData = getElementMigrationData();
    return chain([
      elementMigrationRule({ ...options }, migrationData),
      missingTranslateMigrationRule(options),
      iconPathMigrationRule(options)
    ])(tree, context);
  };
};
