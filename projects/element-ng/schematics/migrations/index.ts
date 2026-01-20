/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, SchematicContext, Rule, chain } from '@angular-devkit/schematics';

import { actionModalMigrationRule } from './action-modal-migration/index.js';
import { elementMigrationRule } from './element-migration/index.js';
import { missingTranslateMigrationRule } from './ngx-translate/index.js';
import { wizardMigrationRule } from './wizard-migration/index.js';

export const v47to48Migration = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting migration from v47 to v48...');
    return chain([
      actionModalMigrationRule(options),
      elementMigrationRule(options),
      wizardMigrationRule(options),
      missingTranslateMigrationRule(options)
    ])(tree, context);
  };
};
