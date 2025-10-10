/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp, readLines } from '../utils';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);

describe('initial migration to version 48', () => {
  const name = 'initial-migration';
  const sourceFile = '/projects/app/src/app/fake-1.ts';
  let runner: SchematicTestRunner;
  let appTree: Tree;

  const runFileMigration = async (file: string, original: string[]): Promise<string[]> => {
    addTestFiles(appTree, {
      [file]: original.join('\n')
    });
    const tree = await runner.runSchematic(name, {}, appTree);
    return readLines(tree, file);
  };

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  describe('si-icon migration', () => {
    it('should migrate icon binding', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should add class icon to si-icon', async () => {
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
      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should move color to class', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should migrate color binding to class', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should re-apply existing classes', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should apply control flow directives at the beginning', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should apply empty attributes at the beginning', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should migrate stackedIcon and stackedColor to span wrapper', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });

    it('should migrate stackedIcon binding', async () => {
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

      const actual = await runFileMigration(sourceFile, original);
      expect(actual).toEqual(expected);
    });
  });
});
