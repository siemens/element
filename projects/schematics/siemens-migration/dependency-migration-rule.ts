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

/**
 * Creates a schematic rule that migrates package dependencies from old packages to new packages.
 *
 * This rule scans all package.json files in the workspace, removes old dependencies,
 * and adds their corresponding new dependencies based on predefined mappings.
 * When SIMPL dependencies are found, it also adds the SIMPL brand dependency.
 *
 * @returns A schematic rule function that performs dependency migration
 *
 * @example
 * ```typescript
 * import { dependencyMigrationRule } from './dependency-migration-rule';
 *
 * export default function(): Rule {
 *   return chain([
 *     dependencyMigrationRule(),
 *     // other rules...
 *   ]);
 * }
 * ```
 *
 * @remarks
 * - Processes all package.json files found in the workspace
 * - Uses DEPENDENCY_MAPPINGS to determine old-to-new package relationships
 * - Automatically triggers npm install if any dependencies were updated
 * - Logs progress and warnings during the migration process
 * - Skips invalid or missing package.json files with appropriate warnings
 */
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
