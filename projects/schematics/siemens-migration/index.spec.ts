/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('siemensMigration', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('siemens-migration', collectionPath);
    const tree = await runner.runSchematic('siemens-migration', {}, Tree.empty());

    expect(tree.files).toEqual([]);
  });
});
