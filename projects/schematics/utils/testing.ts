/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

/**
 * Creates a sample workspace with two applications: 'app' (default) and 'second-app'
 */
export const createTestApp = async (
  runner: SchematicTestRunner,
  appOptions = {},
  files?: { [path: string]: string }
): Promise<UnitTestTree> => {
  let tree = await createWorkspace(runner);
  if (files) {
    addTestFiles(tree, files);
  }
  tree = await runner.runExternalSchematic(
    '@schematics/angular',
    'application',
    { name: 'app', ...appOptions },
    tree
  );

  return runner.runExternalSchematic(
    '@schematics/angular',
    'application',
    { name: 'second-app', ...appOptions },
    tree
  );
};

const createWorkspace = (runner: SchematicTestRunner): Promise<UnitTestTree> => {
  return runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    version: '1.0.0',
    newProjectRoot: 'projects'
  });
};

export const addTestFiles = (tree: Tree, files: { [path: string]: string }): Tree => {
  Object.entries(files).forEach(([path, content]) => {
    if (tree.exists(path)) {
      tree.overwrite(path, content);
    } else {
      tree.create(path, content);
    }
  });
  return tree;
};

export const readLines = (tree: UnitTestTree, path: string): string[] =>
  tree
    .readContent(path)
    .split('\n')
    .filter(l => l.length > 0);

export const removeTestFiles = (tree: Tree, files: string[]): Tree => {
  files.forEach(path => {
    if (tree.exists(path)) {
      tree.delete(path);
    }
  });
  return tree;
};
