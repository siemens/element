/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  removePackageJsonDependency,
  NodeDependency,
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { DependencyType } from '@schematics/angular/utility/dependency';

import { getAllPackageJson } from '../utils';
import { DEPENDENCY_MAPPINGS } from './mappings';
import { MinimalPackageManifest } from './model';

export const dependencyMigrationRule = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const packageJsonPaths = getAllPackageJson(tree);
    let updatedPackageJson = false;
    context.logger.info('📋 Updating package dependencies...');
    for (const packageJsonPath of packageJsonPaths) {
      if (!tree.exists(packageJsonPath)) {
        context.logger.warn(
          `Could not find package.json. Skipping dependency cleanup. ${packageJsonPath}`
        );
        continue;
      }

      const manifest = tree.readJson(packageJsonPath) as MinimalPackageManifest;
      if (!manifest) {
        context.logger.warn(`Invalid package.json at ${packageJsonPath}`);
        continue;
      }

      const dependencySection = manifest?.[DependencyType.Default];
      let hasSimplDependency = false;

      for (const { newPackage, oldPackage } of DEPENDENCY_MAPPINGS) {
        if (dependencySection?.[oldPackage]) {
          hasSimplDependency = true;
          removePackageJsonDependency(tree, oldPackage, packageJsonPath);

          const dep: NodeDependency = {
            type: NodeDependencyType.Default,
            name: newPackage,
            version: __PLACEHOLDER_VERSION__,
            overwrite: true
          };

          addPackageJsonDependency(tree, dep, packageJsonPath);
          updatedPackageJson = true;
        }
      }

      if (hasSimplDependency) {
        addSimplBrandDependency(tree, packageJsonPath);
      }
    }

    if (updatedPackageJson) {
      // Run npm install only once if any package.json was updated
      context.addTask(new NodePackageInstallTask(), []);
    }
  };
};

const addSimplBrandDependency = (tree: Tree, packageJsonPath: string): void => {
  const dep: NodeDependency = {
    type: NodeDependencyType.Default,
    name: `@simpl/brand`,
    version: __SIMPL_BRAND_VERSION__,
    overwrite: true
  };

  addPackageJsonDependency(tree, dep, packageJsonPath);
};
