/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe } from 'vitest';

import { createTestApp } from '../utils';

const collectionPath = path.join(
  process.cwd(),
  'dist/@siemens/element-ng/schematics/collection.json'
);

describe('siemensMigration', () => {
  const name = 'siemens-migration';

  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it('should migrate the application', async () => {
    expect(appTree).toBeTruthy();
  });
});
