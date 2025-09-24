/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export const updateToV48 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update to version 48...');
    return tree;
  };
};
