/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { normalize } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { isAbsolute } from 'path';
import ts from 'typescript';

import { SchematicsFileSystem } from './schematics-file-system';

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
 * Gets the imported symbols from an import declaration.
 */
export const getSymbols = (node: ts.ImportDeclaration): ts.NodeArray<ts.ImportSpecifier> | [] => {
  // Extract all imported component names or module names from @simpl/ imports
  return node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
    ? node.importClause.namedBindings.elements
    : [];
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
