/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { createTestApp } from '../utils/index.js';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);

describe('ng-add schematic', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('@siemens/element-ng', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it('should add required dependencies to package.json', async () => {
    const tree = await runner.runSchematic('ng-add', { path: '/' }, appTree);

    const elementNg = getPackageJsonDependency(tree, '@siemens/element-ng');
    const elementTheme = getPackageJsonDependency(tree, '@siemens/element-theme');
    const elementTranslate = getPackageJsonDependency(tree, '@siemens/element-translate-ng');
    const angularCdk = getPackageJsonDependency(tree, '@angular/cdk');
    const elementIcons = getPackageJsonDependency(tree, '@siemens/element-icons');

    expect(elementNg).toBeDefined();
    expect(elementTheme).toBeDefined();
    expect(elementTranslate).toBeDefined();
    expect(angularCdk).toBeDefined();
    expect(elementIcons).toBeDefined();
  });

  it('should overwrite dependencies that already exist', async () => {
    // Pre-add one dependency
    const packageJsonPath = '/package.json';
    const packageJsonBuffer = appTree.read(packageJsonPath);
    if (!packageJsonBuffer) throw new Error('package.json not found');
    const packageJson = JSON.parse(packageJsonBuffer.toString());
    packageJson.dependencies['@siemens/element-theme'] = '^0.0.1';
    appTree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    const tree = await runner.runSchematic('ng-add', { path: '/' }, appTree);

    const elementTheme = getPackageJsonDependency(tree, '@siemens/element-theme');
    expect(elementTheme?.version).not.toBe('^0.0.1');
  });

  it('should add node_modules to stylePreprocessorOptions', async () => {
    let tree = await runner.runSchematic('ng-add', { path: '/' }, appTree);
    // Styling setup runs after npm install, so manually trigger it for tests
    tree = await runner.runSchematic('ng-add-setup-element-styles', {}, tree);

    const angularJson = JSON.parse(tree.readContent('/angular.json'));
    const buildOptions = angularJson.projects.app.architect.build.options;

    expect(buildOptions.stylePreprocessorOptions).toBeDefined();
    expect(buildOptions.stylePreprocessorOptions.includePaths).toContain('node_modules/');

    const stylePath = (buildOptions.styles as string[]).find(
      p => p.endsWith('.scss') || p.endsWith('.sass')
    );
    expect(stylePath).toBeDefined();

    const globalStyles = tree.readContent(stylePath!);
    expect(globalStyles).toContain(
      "@use '@siemens/element-icons/dist/style/siemens-element-icons';"
    );
    expect(globalStyles).not.toContain(
      "@use '@simpl/element-icons/dist/style/simpl-element-icons';"
    );
  });

  it('should warn if @simpl/element-ng is found', async () => {
    // Add @simpl/element-ng to package.json
    const packageJsonPath = '/package.json';
    const packageJsonBuffer = appTree.read(packageJsonPath);
    if (!packageJsonBuffer) throw new Error('package.json not found');
    const packageJson = JSON.parse(packageJsonBuffer.toString());
    packageJson.dependencies['@simpl/element-ng'] = '^47.0.0';
    appTree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    const tree = await runner.runSchematic('ng-add', { path: '/' }, appTree);

    // Should not add new dependencies when @simpl/element-ng is present
    const elementTheme = getPackageJsonDependency(tree, '@siemens/element-theme');
    expect(elementTheme).toBeNull();
  });

  it('should handle projects without build configuration gracefully', async () => {
    const tree = await runner.runSchematic('ng-add', { path: '/' }, appTree);
    expect(tree).toBeDefined();
  });

  it('should not duplicate node_modules in stylePreprocessorOptions', async () => {
    // Pre-configure stylePreprocessorOptions
    const angularJsonPath = '/angular.json';
    const angularJsonBuffer = appTree.read(angularJsonPath);
    if (!angularJsonBuffer) throw new Error('angular.json not found');
    const angularJson = JSON.parse(angularJsonBuffer.toString());
    angularJson.projects.app.architect.build.options.stylePreprocessorOptions = {
      includePaths: ['node_modules/', 'src/styles']
    };
    appTree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));

    let tree = await runner.runSchematic('ng-add', { path: '/' }, appTree);
    // Styling setup runs after npm install, so manually trigger it for tests
    tree = await runner.runSchematic('ng-add-setup-element-styles', {}, tree);

    const updatedAngularJson = JSON.parse(tree.readContent(angularJsonPath));
    const includePaths =
      updatedAngularJson.projects.app.architect.build.options.stylePreprocessorOptions.includePaths;

    // Count occurrences of 'node_modules/'
    const nodeModulesCount = includePaths.filter((p: string) => p === 'node_modules/').length;
    expect(nodeModulesCount).toBe(1);
  });
});
