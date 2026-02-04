/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { v47to48Migration, v48to49Migration } from '../migrations/index.js';

export const migrate = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 47 to 48...');
    return v47to48Migration({ path: '/' })(tree, context);
  };
};

export const migrateV49 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 48 to 49...');
    return v48to49Migration({ path: '/' })(tree, context);
  };
};
