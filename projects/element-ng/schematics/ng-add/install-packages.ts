/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  getPackageJsonDependency,
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { execSync } from 'child_process';

export const installPackages = (tree: Tree): NodePackageInstallTask => {
  try {
    const latestSimplVersion = execSync('npm view @simpl/element-ng version').toString().trim();
    const latestMappedSiemensVersion = execSync(
      'npm view @simpl/element-ng peerDependencies.@siemens/element-ng'
    )
      .toString()
      .trim();

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@simpl/element-ng',
      version: latestSimplVersion,
      overwrite: true
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@siemens/element-ng',
      version: latestMappedSiemensVersion,
      overwrite: true
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@simpl/element-theme',
      version: latestSimplVersion,
      overwrite: true
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@siemens/element-theme',
      version: latestMappedSiemensVersion,
      overwrite: true
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@simpl/element-translate-ng',
      version: latestSimplVersion,
      overwrite: true
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@siemens/element-translate-ng',
      version: latestMappedSiemensVersion,
      overwrite: true
    });

    if (getPackageJsonDependency(tree, '@simpl/charts-ng')) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@simpl/charts-ng',
        version: latestSimplVersion,
        overwrite: true
      });
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@siemens/charts-ng',
        version: latestMappedSiemensVersion,
        overwrite: true
      });
    }

    if (getPackageJsonDependency(tree, '@simpl/maps-ng')) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@simpl/maps-ng',
        version: latestSimplVersion,
        overwrite: true
      });
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@siemens/maps-ng',
        version: latestMappedSiemensVersion,
        overwrite: true
      });
    }

    if (getPackageJsonDependency(tree, '@simpl/dashboards-ng')) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@simpl/dashboards-ng',
        version: latestSimplVersion,
        overwrite: true
      });
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@siemens/dashboards-ng',
        version: latestMappedSiemensVersion,
        overwrite: true
      });
    }
  } catch (error) {
    const schematicsException = new SchematicsException(
      `Failed to update dependencies. Ensure that:
    - 'npm' is installed
    - the '@simpl' scope is configured in your '.npmrc' and proper authentication is provided`
    );
    schematicsException.cause = error;
    throw schematicsException;
  }

  return new NodePackageInstallTask();
};
