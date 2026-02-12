/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { discoverSourceFiles } from '../../utils/index.js';
import type { ElementMigrationData } from '../data/index.js';
import {
  applyAttributeSelectorMigration,
  applyElementClassMigration,
  applyClassMemberReplacementMigration,
  applyComponentPropertyNameMigration,
  applyElementSelectorMigration,
  applySymbolRemovalMigration,
  applySymbolRenamingMigration
} from '../utilities/index.js';

export const elementMigrationRule = (
  options: { path: string },
  migrationData: ElementMigrationData
): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      if (!tree.read(discoveredSourceFile.path)) {
        continue;
      }

      const recorder = tree.beginUpdate(discoveredSourceFile.path);

      const migrationContext = {
        tree,
        discoveredSourceFile,
        recorder
      };

      const {
        componentPropertyNameChanges,
        symbolRenamingChanges,
        attributeSelectorChanges,
        elementSelectorChanges,
        symbolRemovalChanges,
        elementClassChanges,
        classMemberReplacementChanges
      } = migrationData;

      applyComponentPropertyNameMigration(migrationContext, componentPropertyNameChanges);
      applySymbolRenamingMigration(migrationContext, symbolRenamingChanges);
      applyAttributeSelectorMigration(migrationContext, attributeSelectorChanges);
      applyElementSelectorMigration(migrationContext, elementSelectorChanges);
      applySymbolRemovalMigration(migrationContext, symbolRemovalChanges);
      applyElementClassMigration(migrationContext, elementClassChanges);
      applyClassMemberReplacementMigration(migrationContext, classMemberReplacementChanges);

      tree.commitUpdate(recorder);
    }

    return tree;
  };
};
