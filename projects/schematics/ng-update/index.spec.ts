/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { addTestFiles, createTestApp, readLines } from '../utils';

const migrationPath = path.join(
  process.cwd(),
  'dist/@siemens/element-ng/schematics/migration.json'
);

describe('ng-update migration version 48.0.0', () => {
  const name = 'migrations';
  const sourceFile = '/projects/app/src/app/fake-1.ts';

  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, migrationPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const checkTemplateMigration = async (original: string[], expected: string[]) => {
    addTestFiles(appTree, {
      [sourceFile]: original.join('\n')
    });
    const tree = await runner.runSchematic('migration-v48', { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual(expected);
  };

  describe('si-icon migration', () => {
    test('should migrate icon binding', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon [icon]="elementIcon"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon class="icon" [icon]="elementIcon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should add class icon to si-icon', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon icon="element-icon"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon class="icon" icon="element-icon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should move color to class', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon icon="element-icon" color="dark"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon class="icon dark" icon="element-icon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should migrate color binding to class', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon icon="element-icon" [color]="iconColor"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon [class]="\`icon \${iconColor}\`" icon="element-icon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should re-apply existing classes', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon class="m-2 align-self-center" icon="element-icon"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon class="icon m-2 align-self-center" icon="element-icon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should apply control flow directives at the beginning', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon *ngIf="condition" icon="element-icon"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon *ngIf="condition" class="icon" icon="element-icon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should apply empty attributes at the beginning', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon disabled icon="element-icon"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon disabled class="icon" icon="element-icon" />\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should migrate stackedIcon and stackedColor to span wrapper', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon icon="element-icon" color="dark" stackedIcon="element-icon-stacked" stackedColor="light"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<span class="icon icon-stack">`,
        `  <si-icon class="dark" icon="element-icon" />`,
        `  <si-icon class="light" icon="element-icon-stacked" />`,
        `</span>\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });

    test('should migrate stackedIcon binding', async () => {
      const original = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<si-icon [icon]="elementIcon" color="dark" [stackedIcon]="elementIconStacked" stackedColor="light"></si-icon>\` })`,
        `export class Test {}`
      ];
      const expected = [
        `import { Component } from '@angular/core';`,
        `@Component({ template: \`<span class="icon icon-stack">`,
        `  <si-icon class="dark" [icon]="elementIcon" />`,
        `  <si-icon class="light" [icon]="elementIconStacked" />`,
        `</span>\` })`,
        `export class Test {}`
      ];
      await checkTemplateMigration(original, expected);
    });
  });
});
