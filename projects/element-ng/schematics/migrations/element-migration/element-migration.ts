/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { EmitHint } from 'typescript';

import {
  discoverSourceFiles,
  renameApi,
  renameAttribute,
  renameElementTag,
  renameIdentifier,
  removeSymbol
} from '../../utils/index.js';
import type { ElementMigrationData } from '../data/index.js';

export const elementMigrationRule = (
  options: { path: string },
  migrationData: ElementMigrationData
): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    for await (const { path: filePath, sourceFile, typeChecker } of discoverSourceFiles(
      tree,
      context,
      options.path
    )) {
      const content = tree.read(filePath);
      if (!content) {
        continue;
      }

      let recorder: UpdateRecorder | undefined = undefined;
      let printer: ts.Printer | undefined = undefined;

      const visitor = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
          const locationType = typeChecker.getTypeAtLocation(node.expression);
          if (locationType.symbol?.name === 'SiResponsiveContainerDirective') {
            console.log(node.expression.getText(), locationType.symbol.name, node.name.text);
            // TODO: This successfully identifies property access on SiResponsiveContainerDirective. Now this need to be generalized an the actual transformation needs to be implemented.
          }
        }
        node.forEachChild(visitor);
      };

      sourceFile.forEachChild(visitor);

      // Remove the ifs when it grows a bit more and split into multiple functions
      if (migrationData.componentNameChanges) {
        const changeInstructions = renameIdentifier({
          sourceFile,
          renamingInstructions: migrationData.componentNameChanges
        });

        for (const changeInstruction of changeInstructions) {
          recorder ??= tree.beginUpdate(filePath);
          printer ??= ts.createPrinter();
          recorder.remove(changeInstruction.start, changeInstruction.width);
          recorder.insertLeft(
            changeInstruction.start,
            printer.printNode(EmitHint.Unspecified, changeInstruction.newNode, sourceFile)
          );
        }
      }

      if (migrationData.attributeSelectorChanges) {
        recorder ??= tree.beginUpdate(filePath);

        for (const change of migrationData.attributeSelectorChanges) {
          renameAttribute({
            tree,
            recorder,
            sourceFile,
            filePath,
            fromName: change.replace,
            toName: change.replaceWith
          });
        }
      }

      if (migrationData.elementSelectorChanges) {
        recorder ??= tree.beginUpdate(filePath);

        for (const change of migrationData.elementSelectorChanges) {
          renameElementTag({
            tree,
            recorder,
            sourceFile,
            filePath,
            fromName: change.replace,
            toName: change.replaceWith
          });
        }
      }

      if (migrationData.outputNameChanges) {
        recorder ??= tree.beginUpdate(filePath);

        for (const change of migrationData.outputNameChanges) {
          renameApi({
            tree,
            recorder,
            sourceFile,
            filePath,
            elementName: change.elementSelector,
            apis: change.apiMappings
          });
        }
      }

      if (migrationData.symbolRemovalChanges) {
        recorder ??= tree.beginUpdate(filePath);

        for (const change of migrationData.symbolRemovalChanges) {
          removeSymbol({
            tree,
            recorder,
            sourceFile,
            filePath,
            elementName: change.elementSelector,
            attributeSelector: change.attributeSelector,
            names: change.names
          });
        }
      }

      if (recorder) {
        tree.commitUpdate(recorder);
      }
    }

    return tree;
  };
};
