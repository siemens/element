/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

const migrationPath = path.join(
  process.cwd(),
  'dist/@siemens/element-ng/schematics/migration.json'
);

describe('ng-update migration version 48.0.0', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  const name = 'migrations';

  beforeEach(() => {
    runner = new SchematicTestRunner(name, migrationPath);
    appTree = Tree.empty();
  });

  test('should migrate to v48', async () => {
    const tree = await runner.runSchematic('migration-v48', appTree);
    expect(tree).toBeDefined();
  });
});
