/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { EmitHint } from 'typescript';

import { ElementMigrationConfig } from './element-migration.config.js';
import {
  discoverSourceFiles,
  renameAttribute,
  renameElementTag,
  renameIdentifier
} from './index.js';

export const elementMigrationRule = (
  elementMigrationConfig: ElementMigrationConfig,
  path: string
): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const tsSourceFiles = discoverSourceFiles(tree, context, path);

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

      const changeInstructions = renameIdentifier({
        sourceFile,
        renamingInstructions: elementMigrationConfig.identifierRenameInstructions
      });

      let recorder: UpdateRecorder | undefined = undefined;
      let printer: ts.Printer | undefined = undefined;
      for (const changeInstruction of changeInstructions) {
        recorder ??= tree.beginUpdate(filePath);
        printer ??= ts.createPrinter();
        recorder.remove(changeInstruction.start, changeInstruction.width);
        recorder.insertLeft(
          changeInstruction.start,
          printer.printNode(EmitHint.Unspecified, changeInstruction.newNode, sourceFile)
        );
      }

      if (!recorder) {
        continue;
      }
      for (const [fromName, toName] of elementMigrationConfig.elementRenameInstructions) {
        renameElementTag({
          tree,
          recorder,
          sourceFile,
          filePath,
          fromName,
          toName
        });
      }

      for (const [fromName, toName] of elementMigrationConfig.attributeRenameInstructions) {
        renameAttribute({
          tree,
          recorder,
          sourceFile,
          filePath,
          fromName,
          toName
        });
      }

      tree.commitUpdate(recorder);
    }

    return tree;
  };
};
