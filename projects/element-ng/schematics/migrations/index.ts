/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, SchematicContext, Rule, chain } from '@angular-devkit/schematics';

import { ElementMigrationData, getElementMigrationData } from './data/index.js';
import { elementMigrationRule } from './element-migration/index.js';
import { iconPathMigrationRule } from './icon-path-migration/index.js';
import { missingTranslateMigrationRule } from './ngx-translate/index.js';

export const updateToV49 = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const migrationData: ElementMigrationData = getElementMigrationData();
    return chain([
      elementMigrationRule({ ...options }, migrationData),
      missingTranslateMigrationRule(options),
      iconPathMigrationRule(options)
    ])(tree, context);
  };
};
