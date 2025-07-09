/* eslint-disable headers/header-format, tsdoc/syntax, prefer-arrow/prefer-arrow-functions */
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

/** Regular expression that matches a scoped type package name. */
const scopedTypesPackageRegex = /^@types\/([^_\/]+)__(.+)/;

/**
 * Resolves type modules and returns corresponding path mappings and a
 * list of referenced files.
 */
export async function resolveTypePackages(typeNames: string[]): Promise<{
  paths: Record<string, string[]>;
  typeFiles: string[];
}> {
  const typePackageNames = typeNames.map(t => `@types/${t}`);
  const typeFiles = [];
  const paths: Record<string, string[]> = {};

  for (const typePackageName of typePackageNames) {
    const moduleNames = getModuleNamesForTypePackage(typePackageName);
    const { entryPointTypeFile, resolvedPackageDir } =
      await resolveTypeDeclarationOfPackage(typePackageName);

    typeFiles.push(entryPointTypeFile);

    for (const moduleName of moduleNames) {
      paths[moduleName] = [resolvedPackageDir];
    }
  }

  return { paths, typeFiles };
}

/** Resolves the type declaration entry-point file of a given package. */
async function resolveTypeDeclarationOfPackage(moduleName: string): Promise<{
  entryPointTypeFile: string;
  resolvedPackageDir: string;
}> {
  // We are always executing inside a `.runfiles` directory, inside the workspace directory,
  // so we can access the repository by walking up one directory.
  const pkgJsonPath = path.resolve('../npm/node_modules/' + moduleName + '/package.json');
  const pkgJson = JSON.parse(await fs.promises.readFile(pkgJsonPath, 'utf8')) as {
    types?: string;
    typings?: string;
  };
  const typesRelativePath = pkgJson.types ?? pkgJson.typings;

  if (typesRelativePath === undefined) {
    throw new Error(`Unable to resolve type definition for "${moduleName}".`);
  }

  return {
    entryPointTypeFile: path.join(path.dirname(pkgJsonPath), typesRelativePath),
    resolvedPackageDir: path.dirname(pkgJsonPath)
  };
}

/**
 * Gets the module names for a given type package name.
 *
 * As an example, for `@types/babel__core` this returns both the `babel__core`
 * and `@babel/core` module names.
 */
function getModuleNamesForTypePackage(name: string): string[] {
  if (!name.startsWith('@types/')) {
    return [name];
  }

  const moduleName = name.slice('@types/'.length);
  const matches = name.match(scopedTypesPackageRegex);

  if (matches === null) {
    return [moduleName];
  }

  // Support potential alternative module names for scoped packages. e.g.
  // the `@types/babel__core` package could also be for `@babel/core`.
  return [moduleName, `@${matches[1]}/${matches[2]}`];
}
