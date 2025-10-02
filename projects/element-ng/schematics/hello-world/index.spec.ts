/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);

describe('hello-world', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('hello-world', {}, Tree.empty());

    expect(tree.files).toEqual([]);
  });
});
