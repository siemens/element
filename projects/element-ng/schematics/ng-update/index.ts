/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { v47to48Migration } from '../migrations/index.js';

export const migrate = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update from version 47 to 48...');
    return v47to48Migration({ path: '/' })(tree, context);
  };
};
