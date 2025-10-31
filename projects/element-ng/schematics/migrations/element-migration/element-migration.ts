/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { EmitHint } from 'typescript';

import {
  discoverSourceFiles,
  getImportSpecifiers,
  renameApi,
  renameAttribute,
  renameElementTag,
  renameIdentifier,
  removeSymbol
} from '../../utils/index.js';
import { getElementMigrationData } from '../data/index.js';

export const elementMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const tsSourceFiles = discoverSourceFiles(tree, context, options.path);

    const migrationData = getElementMigrationData();

    for (const filePath of tsSourceFiles) {
      const content = tree.read(filePath);
      if (!content) {
        continue;
      }

      const sourceFile = ts.createSourceFile(
        filePath,
        content.toString(),
        ts.ScriptTarget.Latest,
        true
      );

      let recorder: UpdateRecorder | undefined = undefined;
      let printer: ts.Printer | undefined = undefined;

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
          const importSpecifiers = getImportSpecifiers(
            sourceFile,
            change.module,
            change.componentName
          );

          if (!importSpecifiers?.length) {
            continue;
          }

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
          const importSpecifiers = getImportSpecifiers(
            sourceFile,
            change.module,
            change.componentName
          );

          if (!importSpecifiers?.length) {
            continue;
          }

          removeSymbol({
            tree,
            recorder,
            sourceFile,
            filePath,
            elementName: change.elementSelector,
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
