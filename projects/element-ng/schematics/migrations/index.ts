/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, SchematicContext, Rule, chain } from '@angular-devkit/schematics';

import { actionModalMigrationRule } from './action-modal-migration/index.js';
import { toLegacyMigrationRule } from './to-legacy-migration/to-legacy-migration';

export const v47to48Migration = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting migration from v47 to v48...');
    return chain([actionModalMigrationRule(options), toLegacyMigrationRule(options)])(
      tree,
      context
    );
  };
};
