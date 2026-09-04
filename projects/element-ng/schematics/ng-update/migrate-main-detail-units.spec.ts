/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { callRule, Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';
import { mainDetailUnitsMigrationRule } from './migrate-main-detail-units.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');

describe('main detail units migration', () => {
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
      mainDetailUnitsMigrationRule({ path: 'projects/app/src' }),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('mainDetailUnitsMigrationRule returned undefined');
    }

    return tree;
  };

  it('should add mainUnit="fr" to resizable containers in inline templates', async () => {
    const initialContent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: \`<si-main-detail-container resizableParts [mainContainerWidth]="40">
    <div slot="mainData">Main</div>
    <div slot="details">Details</div>
  </si-main-detail-container>\`
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
  template: \`<si-main-detail-container resizableParts [mainContainerWidth]="40" mainUnit="fr">
    <div slot="mainData">Main</div>
    <div slot="details">Details</div>
  </si-main-detail-container>\`
})
export class TestComponent {}`
    );
  });

  it('should add mainUnit="fr" to resizable containers in external templates', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {}`,
      '/projects/app/src/test.component.html': `<si-main-detail-container [resizableParts]="true" [mainContainerWidth]="32">
  <div slot="mainData">Main</div>
  <div slot="details">Details</div>
</si-main-detail-container>`
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.html')).toBe(
      `<si-main-detail-container [resizableParts]="true" [mainContainerWidth]="32" mainUnit="fr">
  <div slot="mainData">Main</div>
  <div slot="details">Details</div>
</si-main-detail-container>`
    );
  });

  it('should not modify containers without resizableParts', async () => {
    const template = `<si-main-detail-container [mainContainerWidth]="50">
  <div slot="mainData">Main</div>
  <div slot="details">Details</div>
</si-main-detail-container>`;

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

  it('should not modify containers when resizableParts is explicitly false', async () => {
    const template = `<si-main-detail-container resizableParts="false" [mainContainerWidth]="50">
  <div slot="mainData">Main</div>
  <div slot="details">Details</div>
</si-main-detail-container>`;

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

  it('should not overwrite existing mainUnit', async () => {
    const template = `<si-main-detail-container resizableParts mainUnit="px">
  <div slot="mainData">Main</div>
  <div slot="details">Details</div>
</si-main-detail-container>`;

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
