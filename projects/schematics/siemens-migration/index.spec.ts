/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { addTestFiles, createTestApp } from '../utils/testing';

const collectionPath = path.join(__dirname, '../collection.json');

describe('siemensMigration', () => {
  const name = 'siemens-migration';
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner);
  });

  it('works', async () => {
    const tree = await runner.runSchematic('siemens-migration', {}, appTree);
    addTestFiles(tree, {
      'projects/schematics/app/components/fake-1/fake-1.component.ts': `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiButtonComponent } from '@simpl/element-ng/button';
import { SiInputDirective } from '@simpl/element-ng/input';
import { SiSliderComponent } from '@simpl/element-ng/slider';

@Component({
  selector: 'app-fake-1',
  standalone: true,
  imports: [CommonModule, FormsModule, SiButtonComponent, SiInputDirective, SiSliderComponent],
  template: '<h1>Fake Component 1</h1>',
})
export class Fake1Component {
  value = 50;
}
`
    });
    expect(tree.files).toEqual([]);
  });
});
