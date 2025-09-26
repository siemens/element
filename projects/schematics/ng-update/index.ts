/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { SchematicContext, Tree } from '@angular-devkit/schematics';

import { actionDialogMigrationRule } from '../migrations/action-modal';

export const updateToV48 = (_options: { path: string }) => {
  return (tree: Tree, context: SchematicContext) => {
    const rule = actionDialogMigrationRule({ path: _options.path });
    rule(tree, context);
    return tree;
  };
};
