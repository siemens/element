/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

import { actionModalMigrationRule } from './action-modal-migration';

export const ngAdd = (options: any): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Adding @siemens/element-ng to your project...');

    const hasSimplElementNgDependency = getPackageJsonDependency(tree, '@simpl/element-ng');

    if (hasSimplElementNgDependency) {
      const chainedRules = chain([
        schematic('siemens-migration', options),
        actionModalMigrationRule({ path: options.path })
      ]);
      return chainedRules(tree, context);
    }
  };
};
