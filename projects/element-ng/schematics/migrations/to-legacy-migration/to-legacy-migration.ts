/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { EmitHint } from 'typescript';

import {
  discoverSourceFiles,
  renameAttribute,
  renameElementTag,
  renameIdentifier
} from '../../utils/index.js';
import {
  IDENTIFIER_RENAMING_INSTRUCTIONS,
  ELEMENT_RENAMING_INSTRUCTIONS,
  ATTRIBUTE_RENAMING_INSTRUCTIONS
} from './to-legacy-replacement.js';

export const toLegacyMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Running legacy migration rule...');

    const tsSourceFiles = discoverSourceFiles(tree, context, options.path);

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
        renamingInstructions: IDENTIFIER_RENAMING_INSTRUCTIONS
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
      for (const [fromName, toName] of ELEMENT_RENAMING_INSTRUCTIONS) {
        renameElementTag({
          tree,
          recorder,
          sourceFile,
          filePath,
          fromName,
          toName
        });
      }

      for (const [fromName, toName] of ATTRIBUTE_RENAMING_INSTRUCTIONS) {
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
    context.logger.info(`✅ Legacy migration complete!`);
    return tree;
  };
};
