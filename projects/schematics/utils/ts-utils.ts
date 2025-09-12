/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { isAbsolute } from 'path';
import ts from 'typescript';

export const parseTsconfigFile = (
  tsconfigPath: string,
  basePath: string,
  tree: Tree
): ts.ParsedCommandLine => {
  const jsonText = tree.readText(tsconfigPath);

  // Parse the tsconfig file content
  const { config, error } = ts.parseConfigFileTextToJson(tsconfigPath, jsonText);
  if (error) {
    throw new SchematicsException(`Error parsing ${tsconfigPath}: ${error.messageText}`);
  }

  // Create a ts.ParseConfigHost that uses the schematics Tree
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: tree.exists.bind(tree),
    readFile: tree.readText.bind(tree),
    readDirectory: (path, _extensions, _excludes, _includes, _depth) => {
      // This part is tricky. You can implement a custom logic to traverse the Tree
      // or use a utility function if available. A simpler approach is to use the `tree.visit` method
      // as a fallback if a precise implementation is too complex.
      const allFiles: string[] = [];
      tree.visit(file => allFiles.push(file));
      return allFiles.filter(file => file.startsWith(path));
    },
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
