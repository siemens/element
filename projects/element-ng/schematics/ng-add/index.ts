/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

import { addElementDependencies } from './add-dependencies.js';

export const ngAdd = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Adding @siemens/element-ng to your project...');

    const hasSimplElementNgDependency = getPackageJsonDependency(tree, '@simpl/element-ng');

    if (hasSimplElementNgDependency) {
      context.logger.warn(
        '⚠️ Found @simpl/element-ng in dependencies. Please run ng update to migrate to @siemens/element-ng.'
      );
      return tree;
    }

    return chain([addElementDependencies(), schematic('ng-add-setup-element-styles', {})])(
      tree,
      context
    );
  };
};
