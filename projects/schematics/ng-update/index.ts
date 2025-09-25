/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

import { discoverSourceFiles } from '../utils/project-utils';
import { findNodes } from '../utils/ts-utils';

const symbolsToFind = ['ConfirmationDialogResult', 'SiActionDialogService'];
const tokens = [
  '.showAlertDialog',
  '.showConfirmationDialog',
  '.showEditDiscardDialog',
  '.showDeleteConfirmationDialog'
];

export const updateToV48 = (_options: { path: string }) => {
  return (tree: Tree, context: SchematicContext) => {
    //  debugger;

    const sourceFiles = discoverSourceFiles(tree, context, _options.path);
    for (const filePath of sourceFiles) {
      const content = tree.read(filePath);
      if (!content) {
        return;
      }

      const sourceFile = ts.createSourceFile(
        filePath,
        content.toString(),
        ts.ScriptTarget.Latest,
        true
      );
      console.log('---', filePath);
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const crawl = (node: ts.Node) => {
        //   if (tokens.some(t => node.getText().includes(t))) {
        // ts.isCallExpression(node) &&
        // console.log('>>>', node.);
        // && ts.isPropertyAccessExpression(node)
        //  ts.isPropertyAccessExpression(node) &&
        //  node.name.text === 'subscribe'

        if (
          filePath.includes('test.component.ts') &&
          ts.isCallExpression(node) &&
          tokens.some(t => node.expression.getText().endsWith(t))
        ) {
          // const identifier =
          //   ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText();
          console.log(
            node.getText(),
            'kind:',
            ts.SyntaxKind[node.kind],
            node.pos,
            node.getStart(),
            node.end,
            node.getWidth()
          );
          const parts = node.expression.getText().split('.');
          console.log('>>>parts', parts);

          const type = parts.pop();
          const remaining = parts.join('.');
          console.log('>>>type', type);

          console.log('>>>remaining');
          console.log('Args', node.arguments.map(a => a.getText()).join(', '));

          const args = node.arguments;

          console.log(
            '>>>args',
            args.at(0)?.pos,
            args.at(0)?.getFullStart(),
            args.at(0)?.getStart()
          );

          if (
            type === 'showAlertDialog' ||
            type === 'showEditDiscardDialog' ||
            type === 'showConfirmationDialog' ||
            type === 'showDeleteConfirmationDialog'
          ) {
            const sourceText = sourceFile.getFullText();
            const textBeforeNode = sourceText.substring(0, node.getFullStart());
            const lastNewline = textBeforeNode.lastIndexOf('\n');
            const currentLineStart = lastNewline + 1;
            const currentLine = sourceText.substring(currentLineStart, node.getStart());
            const indentMatch = currentLine.match(/^(\s*)/);
            const indentation = indentMatch ? indentMatch[1] : '';

            const heading = args[1].getText()
              ? `, \n${indentation} heading: ${args[1].getText()}`
              : '';
            const confirmBtnName = args[2].getText()
              ? `, \n${indentation} icon: ${args[2].getText()}`
              : '';
            const translationParams = args[3].getText()
              ? `, \n${indentation} translationParams: ${args[3].getText()}`
              : '';
            const icon = args[4]?.getText() ? `, \n${indentation} icon: ${args[4].getText()}` : '';
            const diOptions = args[5]?.getText()
              ? `, \n${indentation} diOptions: ${args[5].getText()}`
              : '';

            const newImpl = `${remaining}.showActionDialog({\n${indentation} type: 'alert', \n${indentation} message: ${args[0].getText()}${heading}${confirmBtnName}${translationParams}${icon}${diOptions} })`;

            console.log('>>>newImpl', newImpl);
            const recorder = tree.beginUpdate(filePath);

            recorder.remove(node.getStart(), node.getWidth());
            recorder.insertLeft(node.getStart(), newImpl);
            tree.commitUpdate(recorder);
          }

          //    const ee = node.expression;

          // const importExpression = ts.isCallExpression(node)
          //   ? node.expression // Navigate to the underlying expression for 'then'
          //   : callExpression;

          //   console.log('>>>', node, node.getText());
        }
        //  }
        node.forEachChild(crawl);
      };

      sourceFile.forEachChild(node => crawl(node));

      // Find all import declarations in the source file
      const allImports = findNodes(
        sourceFile,
        ts.SyntaxKind.ImportDeclaration
      ) as ts.ImportDeclaration[];

      const allElementNgImports = allImports.filter(
        node =>
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          (node.moduleSpecifier.text.startsWith('@simpl/element-ng') ||
            node.moduleSpecifier.text.startsWith('@siemens/element-ng')) &&
          node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings) &&
          node.importClause.namedBindings.elements.some(e => symbolsToFind.includes(e.getText()))
      );

      for (const node of allElementNgImports) {
        const symbols = getSymbols(node);
      }
    }
    // context.logger.info('🚀 Starting update to version 48...');
    return tree;
  };
};

const buildNewImpl = (remaining: string, args: ts.NodeArray<ts.Expression>, baseIndent: string) => {
  const objIndent = baseIndent + '  ';

  const properties = [
    `${objIndent}type: 'alert'`,
    `${objIndent}message: ${args[0].getText()}`
  ];

  if (args[1]?.getText()) properties.push(`${objIndent}heading: ${args[1].getText()}`);
  if (args[2]?.getText()) properties.push(`${objIndent}confirmBtnName: ${args[2].getText()}`);
  if (args[3]?.getText()) properties.push(`${objIndent}translationParams: ${args[3].getText()}`);
  if (args[4]?.getText()) properties.push(`${objIndent}icon: ${args[4].getText()}`);
  if (args[5]?.getText()) properties.push(`${objIndent}diOptions: ${args[5].getText()}`);

  return [
    `${remaining}.showActionDialog({`,
    properties.join(',\n'),
    `${baseIndent}})`
  ].join('\n');
};

export const getSymbols = (node: ts.ImportDeclaration): ts.NodeArray<ts.ImportSpecifier> | [] => {
  // Extract all imported component names or module names from @simpl/ imports

  if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
    return node.importClause.namedBindings.elements;
  }

  return [];
  // const symbols =  && node.importClause.namedBindings.elements.some(r=> r.getText() === 'DestroyRef')
  //   ? node.importClause.namedBindings.elements
  //   : [];
  // return symbols;
};
