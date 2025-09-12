/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

/**
 * Creates a sample workspace with two applications: 'app' (default) and 'second-app'
 */
export const createTestApp = async (
  runner: SchematicTestRunner,
  appOptions = {}
): Promise<UnitTestTree> => {
  let tree = await createWorkspace(runner);
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
