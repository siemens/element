/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addDependency,
  ExistingBehavior,
  InstallBehavior
} from '@schematics/angular/utility/dependency';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Adds required Element dependencies to package.json
 */
export const addElementDependencies = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const elementVersion = `^${packageJson.version}`;
    const cdkVersion = `^${packageJson.peerDependencies['@angular/cdk']}`;
    const elementIconsVersion = `^${packageJson.peerDependencies['@siemens/element-icons']}`;

    const options = {
      existing: ExistingBehavior.Replace,
      install: InstallBehavior.Auto
    };

    return chain([
      addDependency('@siemens/element-ng', elementVersion, options),
      addDependency('@siemens/element-theme', elementVersion, options),
      addDependency('@siemens/element-translate-ng', elementVersion, options),
      addDependency('@angular/cdk', cdkVersion, options),
      addDependency('@simpl/brand', '2.2.0', options),
      addDependency('@siemens/element-icons', elementIconsVersion, options)
    ])(tree, context);
  };
};
