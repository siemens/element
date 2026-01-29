/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, SchematicContext, Rule, chain } from '@angular-devkit/schematics';

import { elementMigrationRule } from './element-migration/index.js';
import { missingTranslateMigrationRule } from './ngx-translate/index.js';

export const v47to48Migration = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting migration from v47 to v48...');
    return chain([elementMigrationRule(options), missingTranslateMigrationRule(options)])(
      tree,
      context
    );
  };
};
