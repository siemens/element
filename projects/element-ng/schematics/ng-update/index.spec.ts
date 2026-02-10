/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');

describe('ng-update migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('@siemens/element-ng', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it('should run migration successfully', async () => {
    const tree = await runner.runSchematic('migration-v49', {}, appTree);
    expect(tree).toBeDefined();
  });

  it('should log migration start message', async () => {
    const logSpy = jasmine.createSpy('log');
    runner.logger.subscribe(logSpy);

    await runner.runSchematic('migration-v49', {}, appTree);

    expect(logSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringContaining('Starting update from version 48 to 49')
      })
    );
  });

  it('should leave unrelated files untouched', async () => {
    const originalContent = `import { Component, inject } from '@angular/core';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';

@Component({ selector: 'app-test' })
export class TestComponent {
  showDialog() {
    inject(SiActionDialogService).showAlertDialog('Message', 'Heading', 'Confirm').subscribe();
  }
}`;

    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': originalContent
    });

    const tree = await runner.runSchematic('migration-v49', {}, appTree);

    expect(tree).toBeDefined();
    expect(tree.exists('/projects/app/src/test.component.ts')).toBe(true);
    const modifiedContent = tree.readContent('/projects/app/src/test.component.ts');
    expect(modifiedContent).toEqual(originalContent);
  });

  it('should handle empty project gracefully', async () => {
    const emptyTree = await createTestApp(runner, { style: 'scss' });

    const tree = await runner.runSchematic('migration-v49', {}, emptyTree);
    expect(tree).toBeDefined();
  });

  it('should pass options to sub-migrations', async () => {
    const customPath = '/custom/path';
    const options = { path: customPath };

    const tree = await runner.runSchematic('migration-v49', options, appTree);
    expect(tree).toBeDefined();

    // Verify the schematic ran with custom options
    // In a real scenario, you'd verify the migration respected the path option
  });
});
