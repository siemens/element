/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { normalize } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { dirname, isAbsolute } from 'path';
import ts from 'typescript';

import { SchematicsFileSystem } from './schematics-file-system';

export interface AngularTemplate {
  filePath: string;
  offset: number;
  text: string;
}

export const findClassDecorators = (
  filePaths: string[],
  name: string,
  tree: Tree
): ts.Decorator[] => {
  const decorators: ts.Decorator[] = [];
  for (const filePath of filePaths) {
    const source = getSource(tree, filePath);
    ts.forEachChild(source, (node: ts.Node) => {
      // Skipping any non component declarations
      if (!ts.isClassDeclaration(node)) {
        return;
      }
      decorators.push(...getClassDecorators(node).filter(d => name === getDecoratorName(d)));
    });
  }
  return decorators;
};

/**
 * Reads and parses a tsconfig file from the given path.
 */
export const parseTsconfigFile = (
  tsconfigPath: string,
  basePath: string,
  tree: Tree
): ts.ParsedCommandLine => {
  // Parse the tsconfig file content
  const fs = new SchematicsFileSystem(tree);
  const { config, error } = ts.readConfigFile(tsconfigPath, fs.readText);
  if (error) {
    throw new SchematicsException(`Error parsing ${tsconfigPath}: ${error.messageText}`);
  }

  // Create a ts.ParseConfigHost that uses the schematics Tree
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: fs.exists,
    readFile: fs.readText,
    readDirectory: (path, _extensions, _excludes, _includes, _depth) => visitDirectory(fs, path),
    useCaseSensitiveFileNames: true
  };

  // Throw if incorrect arguments are passed to this function. Passing relative base paths
  // results in root directories not being resolved and in later type checking runtime errors.
  // More details can be found here: https://github.com/microsoft/TypeScript/issues/37731.
  if (!isAbsolute(basePath)) {
    throw Error('Unexpected relative base path has been specified.');
  }

  return ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, {});
};

/**
 * Finds all nodes which match the given kind.
 */
export const findNodes = <T extends ts.Node>(
  node: ts.Node,
  kindOrGuard: ts.SyntaxKind | ((node: ts.Node) => node is T),
  max = Infinity,
  recursive = false
): T[] => {
  if (!node || max == 0) {
    return [];
  }

  const test =
    typeof kindOrGuard === 'function'
      ? kindOrGuard
      : // eslint-disable-next-line @typescript-eslint/no-shadow
        (node: ts.Node): node is T => node.kind === kindOrGuard;

  const arr: T[] = [];
  if (test(node)) {
    arr.push(node);
    max--;
  }
  if (max > 0 && (recursive || !test(node))) {
    for (const child of node.getChildren()) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func, @typescript-eslint/no-shadow
      findNodes(child, test, max, recursive).forEach(node => {
        if (max > 0) {
          arr.push(node);
        }
        max--;
      });

      if (max <= 0) {
        break;
      }
    }
  }

  return arr;
};

export const getClassDecorators = (classNode: ts.ClassDeclaration): ts.Decorator[] => {
  return Array.from(ts.getDecorators(classNode) ?? []);
};

export const getComponentMetadata = (
  decorator: ts.Decorator
): Record<string, { offset: number; text: string }> => {
  const args = (decorator.expression as ts.CallExpression).arguments;
  const configObject = args.at(0) as ts.ObjectLiteralExpression;
  const metadata: Record<string, any> = {};
  configObject.properties.forEach(property => {
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) {
      return;
    }

    const propertyName = property.name.text;
    const initializer = property.initializer;
    property.initializer.getStart();
    if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
      metadata[propertyName] = { offset: initializer.getStart(), text: initializer.text };
    }
  });

  return metadata;
};

export const getDecoratorName = (decorator: ts.Decorator): string | undefined => {
  const expression = decorator.expression;

  // Handle @DecoratorName
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }

  // Handle @DecoratorName(...args)
  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
    return expression.expression.text;
  }

  return undefined;
};

/**
 * Gets the import nodes from a TypeScript file which start the given import path.
 */
export const getImportNodes = (
  filePath: string,
  content: string,
  specifier: string
): ts.ImportDeclaration[] => {
  const sourceFile = ts.createSourceFile(
    filePath,
    content.toString(),
    ts.ScriptTarget.Latest,
    true
  );

  // Find all import declarations in the source file
  const allImports = findNodes(
    sourceFile,
    ts.SyntaxKind.ImportDeclaration
  ) as ts.ImportDeclaration[];

  return allImports.filter(
    node =>
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text.startsWith(specifier)
  );
};

/**
 * Reads and returns a TypeScript source file from the given tree.
 */
export const getSource = (tree: Tree, filePath: string): ts.SourceFile => {
  const content = tree.readText(filePath).replace(/^\uFEFF/, '');
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
};

/**
 * Gets the imported symbols from an import declaration.
 */
export const getSymbols = (node: ts.ImportDeclaration): ts.NodeArray<ts.ImportSpecifier> | [] => {
  // Extract all imported component names or module names from @simpl/ imports
  return node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
    ? node.importClause.namedBindings.elements
    : [];
};

export const getTemplate = (tree: Tree, decorator: ts.Decorator): AngularTemplate | undefined => {
  const metadata = getComponentMetadata(decorator);
  const filePath = decorator.getSourceFile().fileName;
  if (metadata.template) {
    return {
      filePath: filePath,
      offset: metadata.template.offset + 1, // For the beginning single quote
      text: metadata.template.text
    };
  } else if (metadata.templateUrl) {
    const templatePath = normalize(`${dirname(filePath)}/${metadata.templateUrl.text}`);
    const templateContent = tree.readText(templatePath);
    if (templateContent) {
      return {
        filePath: templatePath,
        offset: 0,
        text: templateContent.toString()
      };
    }
  }
  return undefined;
};

const visitDirectory = (fs: SchematicsFileSystem, dirPath: string): string[] => {
  const entries = fs.getDir(dirPath);
  const files: string[] = [];
  entries.subfiles.forEach(filename => {
    const fullPath = normalize(`${dirPath}/${filename}`);
    files.push(fullPath);
  });

  entries.subdirs.forEach(subdirname => {
    const newFiles = visitDirectory(fs, `${dirPath}/${subdirname}`);
    files.push(...newFiles);
  });

  return files;
};
