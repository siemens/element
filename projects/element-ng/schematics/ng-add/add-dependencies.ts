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

import packageJson from '../../package.json';

/**
 * Adds required Element dependencies to package.json
 */
export const addElementDependencies = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const elementVersion = `^${packageJson.version}`;
    const cdkVersion = `^${packageJson.peerDependencies['@angular/cdk']}`;

    const options = {
      existing: ExistingBehavior.Replace,
      install: InstallBehavior.Auto
    };

    return chain([
      addDependency('@siemens/element-ng', elementVersion, options),
      addDependency('@siemens/element-theme', elementVersion, options),
      addDependency('@siemens/element-translate-ng', elementVersion, options),
      addDependency('@angular/cdk', cdkVersion, options),
      addDependency('@simpl/brand', '3.1.0', options),
      addDependency('@siemens/element-icons', '^1.0.0', options)
    ])(tree, context);
  };
};
