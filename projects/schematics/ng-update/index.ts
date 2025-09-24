/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { iconMigrationRule } from './icon-migration';

export const updateToV48 = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting update to version 48...');
    const chainedRules = chain([iconMigrationRule()]);
    return chainedRules(tree, context);
  };
};
