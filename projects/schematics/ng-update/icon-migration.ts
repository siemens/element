/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { discoverSourceFiles, getSource } from 'utils';

export const iconMigrationRule = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    const sourceFiles = discoverSourceFiles(tree, context, '');

    for (const filePath of sourceFiles) {
      const source = getSource(tree, filePath);
      ts.forEachChild(source, (node: ts.Node) => {
        // Skipping any non component declarations
        if (!ts.isClassDeclaration(node)) {
          return;
        }
      });
    }

    return chain([...rules]);
  };
};
