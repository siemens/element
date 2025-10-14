/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

export const ngAdd = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Adding @siemens/element-ng to your project...');

    const hasSimplElementNgDependency = getPackageJsonDependency(tree, '@simpl/element-ng');
    const rules = [];
    if (hasSimplElementNgDependency) {
      rules.push(schematic('siemens-migration', options));
    }
    rules.push(schematic('initial-migration', options));
    const chainedRules = chain(rules);
    return chainedRules(tree, context);
  };
};
