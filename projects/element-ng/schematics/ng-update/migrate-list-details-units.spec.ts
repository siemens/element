/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { callRule, Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../testing/index.js';
import { listDetailsUnitsMigrationRule } from './migrate-list-details-units.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');

interface MigrationCase {
  id: string;
  name: string;
  initial: string;
  expected: string;
  inline?: boolean;
}

const unchangedTemplate = (id: string, name: string, template: string): MigrationCase => ({
  id,
  name,
  initial: template,
  expected: template
});

const migrationCases: MigrationCase[] = [
  {
    id: 'inline-resizable',
    name: 'adds listWidthUnit="fr" to resizable list-details in inline templates',
    initial: `<si-list-details [listWidth]="40">
    <si-list-pane>List</si-list-pane>
    <si-details-pane>Details</si-details-pane>
  </si-list-details>`,
    expected: `<si-list-details [listWidth]="40" listWidthUnit="fr">
    <si-list-pane>List</si-list-pane>
    <si-details-pane>Details</si-details-pane>
  </si-list-details>`,
    inline: true
  },
  {
    id: 'resizing-false',
    name: 'adds listWidthUnit="fr" when disableResizing is false',
    initial: `<si-list-details [disableResizing]="false" [listWidth]="32">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`,
    expected: `<si-list-details [disableResizing]="false" [listWidth]="32" listWidthUnit="fr">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`
  },
  unchangedTemplate(
    'resizing-present',
    'does not modify list-details when disableResizing is present',
    `<si-list-details disableResizing [listWidth]="50">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`
  ),
  unchangedTemplate(
    'resizing-true',
    'does not modify list-details when disableResizing is true',
    `<si-list-details [disableResizing]="true" [listWidth]="50">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`
  ),
  ...['listWidthUnit="px"', '[listWidthUnit]="unit"', 'bind-listWidthUnit="unit"'].map(
    (unitAttribute, index) =>
      unchangedTemplate(
        `existing-unit-${index}`,
        `does not overwrite existing ${unitAttribute}`,
        `<si-list-details ${unitAttribute} [listWidth]="300">
  <si-list-pane>List</si-list-pane>
  <si-details-pane>Details</si-details-pane>
</si-list-details>`
      )
  )
];

const externalComponent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {}`;

const inlineComponent = (template: string): string => `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: \`${template}\`
})
export class TestComponent {}`;

describe('list details units migration', () => {
  let migratedTree: Tree;

  beforeAll(async () => {
    const runner = new SchematicTestRunner('migration-v51', collectionPath);
    const appTree = await createTestApp(runner, { style: 'scss' });

    for (const migrationCase of migrationCases) {
      const basePath = `/projects/app/src/cases/${migrationCase.id}/test.component`;
      addTestFiles(
        appTree,
        migrationCase.inline
          ? { [`${basePath}.ts`]: inlineComponent(migrationCase.initial) }
          : {
              [`${basePath}.ts`]: externalComponent,
              [`${basePath}.html`]: migrationCase.initial
            }
      );
    }

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
    migratedTree = tree;
  });

  it.each(migrationCases)('$name', migrationCase => {
    const extension = migrationCase.inline ? 'ts' : 'html';
    const targetPath = `/projects/app/src/cases/${migrationCase.id}/test.component.${extension}`;
    const expected = migrationCase.inline
      ? inlineComponent(migrationCase.expected)
      : migrationCase.expected;

    expect(migratedTree.readText(targetPath)).toBe(expected);
  });
});
