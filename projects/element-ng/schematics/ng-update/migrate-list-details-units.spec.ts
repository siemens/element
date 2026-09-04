/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { callRule, Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';
import { listDetailsUnitsMigrationRule } from './migrate-list-details-units.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');

describe('list details units migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('migration-v51', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const runMigration = async (): Promise<Tree> => {
    const context = runner.engine.createContext(
      runner.engine.createSchematic('migration-v51', runner.engine.createCollection(collectionPath))
    );
    const tree = await callRule(
      listDetailsUnitsMigrationRule({ path: 'projects/app/src' }),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('listDetailsUnitsMigrationRule returned undefined');
    }

    return tree;
  };

  it('should add listUnit="fr" to resizable list-details in inline templates', async () => {
    const initialContent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: \`<si-list-details [listWidth]="40">
    <si-list-pane>List</si-list-pane>
    <si-details-pane>Details</si-details-pane>
  </si-list-details>\`
})
export class TestComponent {}`;

    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': initialContent
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.ts')).toBe(
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: \`<si-list-details [listWidth]="40" listUnit="fr">
    <si-list-pane>List</si-list-pane>
    <si-details-pane>Details</si-details-pane>
  </si-list-details>\`
})
export class TestComponent {}`
    );
  });

  it('should add listUnit="fr" to list-details with [disableResizing]="false"', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {}`,
      '/projects/app/src/test.component.html': `<si-list-details [disableResizing]="false" [listWidth]="32">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.html')).toBe(
      `<si-list-details [disableResizing]="false" [listWidth]="32" listUnit="fr">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`
    );
  });

  it('should not modify list-details when disableResizing attribute is present', async () => {
    const template = `<si-list-details disableResizing [listWidth]="50">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`;

    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {}`,
      '/projects/app/src/test.component.html': template
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.html')).toBe(template);
  });

  it('should not modify list-details when disableResizing is explicitly true', async () => {
    const template = `<si-list-details [disableResizing]="true" [listWidth]="50">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`;

    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {}`,
      '/projects/app/src/test.component.html': template
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.html')).toBe(template);
  });

  it('should not overwrite existing listUnit', async () => {
    const template = `<si-list-details listUnit="px" [listWidth]="300">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`;

    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {}`,
      '/projects/app/src/test.component.html': template
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.html')).toBe(template);
  });
});
