/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../testing/index.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');
const componentPath = '/projects/app/src/test.component.ts';
const templatePath = '/projects/app/src/test.component.html';

describe('ng-update v52 migration', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('@siemens/element-ng', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const runMigration = async (
    files: Record<string, string>
  ): Promise<{ tree: UnitTestTree; warnings: string[] }> => {
    addTestFiles(appTree, files);
    const warnings: string[] = [];
    const subscription = runner.logger.subscribe(entry => {
      if (entry.level === 'warn') {
        warnings.push(entry.message);
      }
    });
    const tree = await runner.runSchematic('migration-v52', {}, appTree);
    subscription.unsubscribe();
    return { tree, warnings };
  };

  it('should move the typeahead of a search bar to a projected input', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';

@Component({
  selector: 'app-test',
  imports: [SiSearchBarComponent, SiTypeaheadDirective],
  templateUrl: './test.component.html'
})
export class TestComponent {
  states = ['Alabama'];
  select(match: unknown): void {}
}
`,
      [templatePath]: `<si-search-bar
  placeholder="State"
  [siTypeahead]="states"
  [typeaheadMinLength]="0"
  (typeaheadOnSelect)="select($event)"
/>
<si-search-bar placeholder="Name" />
`
    });

    expect(tree.readContent(templatePath)).toBe(`<si-search-bar>
  <input
    siSearchBarInput
    placeholder="State"
    [siTypeahead]="states"
    [typeaheadMinLength]="0"
    (typeaheadOnSelect)="select($event)"
  />
</si-search-bar>
<si-search-bar placeholder="Name" />
`);
    const component = tree.readContent(componentPath);
    expect(component).toContain(
      `import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';`
    );
    expect(component).toContain(
      'imports: [SiSearchBarComponent, SiSearchBarInputDirective, SiTypeaheadDirective]'
    );
    expect(warnings).toEqual([]);
  });

  it('should report typeahead usages that need a manual migration', async () => {
    const component = `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';

@Component({
  selector: 'app-test',
  imports: [FormsModule, SiSearchBarComponent, SiSearchBarInputDirective, SiTypeaheadDirective],
  template: \`
    <si-search-bar [siTypeahead]="states">
      <input siSearchBarInput />
    </si-search-bar>
    <si-search-bar [siTypeahead]="states" [(ngModel)]="term" (searchChange)="find($event)" />
    <textarea [siTypeahead]="states"></textarea>
    <input [siTypeahead]="states" />
  \`
})
export class TestComponent {
  states = ['Alabama'];
  term = '';
  find(term: string): void {}
}
`;
    const { tree, warnings } = await runMigration({ [componentPath]: component });

    expect(tree.readContent(componentPath)).toBe(component);
    expect(warnings).toEqual([
      'projects/app/src/test.component.ts:10:5: Skipped si-search-bar. It already projects an input with `siSearchBarInput`. Move `siTypeahead` and the other typeahead bindings to that input manually.',
      'projects/app/src/test.component.ts:13:5: Skipped si-search-bar. It uses `(searchChange)` together with a form binding. Migrate it manually by projecting an `<input siSearchBarInput>`, moving the typeahead bindings to it, and binding a form field to it.',
      'projects/app/src/test.component.ts:14:5: `siTypeahead` only supports `<input>` elements. Move it and the other typeahead bindings of `<textarea>` to an input manually.'
    ]);
  });
});
