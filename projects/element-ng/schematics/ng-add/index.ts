/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

import { installPackages } from './install-packages.js';

export const ngAdd = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Adding @siemens/element-ng to your project...');

    const hasSimplElementNgDependency = getPackageJsonDependency(tree, '@simpl/element-ng');

    if (hasSimplElementNgDependency) {
      context.addTask(installPackages(tree));
      return chain([schematic('simpl-siemens-migration', options)])(tree, context);
    }
  };
};
