/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('ngAdd', () => {
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;

  beforeEach(() => {
    tree = new UnitTestTree(Tree.empty());
    tree.create('/tsconfig.json', '{}');
    tree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          t: { root: '', architect: { build: { options: { tsConfig: './tsconfig.json' } } } }
        }
      })
    );
    const collectionJsonPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../collection.json'
    );
    runner = new SchematicTestRunner('test', collectionJsonPath);
  });

  it('should add dependencies to package.json', async () => {
    tree.create(
      '/package.json',
      JSON.stringify({
        dependencies: {
          '@angular/core': '^20.0.0',
          '@simpl/element-ng': '47.0.0',
          '@simpl/element-theme': '47.0.0',
          '@simpl/charts-ng': '47.0.0',
          '@simpl/element-translate-ng': '47.0.0',
          '@simpl/maps-ng': '47.0.0',
          '@simpl/dashboards-ng': '47.0.0'
        }
      })
    );
    tree = await runner.runSchematic('ng-add', {}, tree);
    const updatedPackage = JSON.parse(tree.readContent('/package.json')).dependencies;
    expect(updatedPackage['@simpl/element-ng']).toBeDefined();
    expect(updatedPackage['@siemens/element-ng']).toBeDefined();
    expect(updatedPackage['@simpl/element-theme']).toBeDefined();
    expect(updatedPackage['@siemens/element-theme']).toBeDefined();
    expect(updatedPackage['@simpl/element-translate-ng']).toBeDefined();
    expect(updatedPackage['@siemens/element-translate-ng']).toBeDefined();
    expect(updatedPackage['@simpl/maps-ng']).toBeDefined();
    expect(updatedPackage['@siemens/maps-ng']).toBeDefined();
    expect(updatedPackage['@simpl/charts-ng']).toBeDefined();
    expect(updatedPackage['@siemens/charts-ng']).toBeDefined();
    expect(updatedPackage['@simpl/dashboards-ng']).toBeDefined();
    expect(updatedPackage['@siemens/dashboards-ng']).toBeDefined();
  });
});
