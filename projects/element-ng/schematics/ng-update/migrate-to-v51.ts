/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { ElementMigrationData, getElementMigrationData } from '../migrations/data/index.js';
import { elementMigrationRule } from '../migrations/element-migration/element-migration.js';
import { missingTranslateMigrationRule } from '../migrations/ngx-translate/index.js';
import { contentFormatterMigrationRule } from './migrate-content-formatter.js';
import { listDetailsUnitsMigrationRule } from './migrate-list-details-units.js';
import { mainDetailUnitsMigrationRule } from './migrate-main-detail-units.js';
import { markdownRendererMigrationRule } from './migrate-markdown-renderer.js';
import { spacerMigrationRule } from './migrate-spacers.js';
import { splitCollapseMigrationRule } from './migrate-split-collapse.js';
import { splitScaleMigrationRule } from './migrate-split-scale.js';
import { splitSizesMigrationRule } from './migrate-split-sizes.js';

export const migrateToV51 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 49 to 51...');
    const migrationData: ElementMigrationData = getElementMigrationData();
    const options = { path: '/' };
    return chain([
      elementMigrationRule(options, migrationData),
      missingTranslateMigrationRule(options),
      splitScaleMigrationRule(options),
      splitSizesMigrationRule(options),
      splitCollapseMigrationRule(options),
      mainDetailUnitsMigrationRule(options),
      listDetailsUnitsMigrationRule(options),
      contentFormatterMigrationRule(options),
      markdownRendererMigrationRule(options),
      spacerMigrationRule(options)
    ])(tree, context);
  };
};
