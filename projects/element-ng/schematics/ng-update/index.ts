/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { updateToV49 } from '../migrations/index.js';

export const migrateToV49 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 48 to 49...');
    return updateToV49({ path: '/' })(tree, context);
  };
};
