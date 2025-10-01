/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export const ngAdd = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Adding @siemens/element-ng to your project...');
    return tree;
  };
};
