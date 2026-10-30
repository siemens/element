/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { AngularCompilerOptions, NgtscProgram } from '@angular/compiler-cli';
import * as path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../testing/index.js';
import { createTreeAwareCompilerHost } from '../utils/index.js';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);
const componentPath = '/projects/app/src/test.component.ts';
const templatePath = '/projects/app/src/test.component.html';

const getComponentDiagnostics = (tree: UnitTestTree): string[] => {
  const compilerTree = tree.branch();
  const searchBarPath = 'projects/app/src/search-bar-stub.ts';
  addTestFiles(compilerTree, {
    [searchBarPath]: `import { Component, Directive, input, output } from '@angular/core';

@Component({ selector: 'si-search-bar', template: '<ng-content />' })
export class SiSearchBarComponent {
  readonly placeholder = input('');
  readonly searchChange = output<string>();
}

@Directive({ selector: 'input[siSearchBarInput]' })
export class SiSearchBarInputDirective {}
`
  });
  const options: AngularCompilerOptions = {
    strict: true,
    strictTemplates: true,
    experimentalDecorators: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    noEmit: true,
    types: [],
    paths: {
      '@siemens/element-ng/search-bar': [path.resolve(searchBarPath)]
    }
  };
  const program = new NgtscProgram(
    [path.resolve(componentPath.slice(1))],
    options,
    createTreeAwareCompilerHost(compilerTree, options)
  );
  return [
    ...program.getTsOptionDiagnostics(),
    ...program.getTsSyntacticDiagnostics(),
    ...program.getTsSemanticDiagnostics(),
    ...program.getNgOptionDiagnostics(),
    ...program.getNgSemanticDiagnostics()
  ]
    .filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)
    .map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
};

describe('search bar migration', () => {
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
    const tree = await runner.runSchematic(
      'migrate-search-bar',
      { path: 'projects/app/src' },
      appTree
    );
    subscription.unsubscribe();
    return { tree, warnings };
  };

  it('should move deprecated inputs, form and typeahead bindings to a projected input', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';

@Component({
  selector: 'app-states',
  imports: [FormsModule, SiSearchBarComponent, SiTypeaheadDirective],
  templateUrl: './test.component.html'
})
export class TestComponent {
  states = ['Alabama'];
  selected = '';
  disable = false;
  onSelect(match: unknown): void {}
}
`,
      [templatePath]: `<si-search-bar
  #typeahead="si-typeahead"
  placeholder="Placeholder"
  i18n-placeholder="@@states.placeholder"
  aria-label="States"
  colorVariant="base-0"
  prohibitedCharacters=""
  [siTypeahead]="states"
  [typeaheadTokenize]="false"
  [disabled]="disable"
  [showIcon]="true"
  [(ngModel)]="selected"
  (typeaheadOnSelect)="onSelect($event)"
/>
`
    });

    expect(tree.readContent(templatePath))
      .toBe(`<si-search-bar colorVariant="base-0" [showIcon]="true">
  <input
    #typeahead="si-typeahead"
    siSearchBarInput
    placeholder="Placeholder"
    i18n-placeholder="@@states.placeholder"
    aria-label="States"
    [siTypeahead]="states"
    [typeaheadTokenize]="false"
    [disabled]="disable"
    [(ngModel)]="selected"
    (typeaheadOnSelect)="onSelect($event)"
  />
</si-search-bar>
`);
    const component = tree.readContent(componentPath);
    expect(component).toContain(
      `import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';`
    );
    expect(component).toContain(
      'imports: [FormsModule, SiSearchBarComponent, SiSearchBarInputDirective, SiTypeaheadDirective]'
    );
    expect(warnings).toEqual([
      'projects/app/src/test.component.html:1:1: The search bar debounced form value changes by 400 ms. The projected input updates the form value immediately. Debounce the value changes in your code if needed.'
    ]);
  });

  it('should keep the behavior of bound maxlength and value inputs', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [SiSearchBarComponent],
  templateUrl: './test.component.html'
})
export class TestComponent {
  max = 10;
  term = 'Initial';
  optionalTerm?: string;
}
`,
      [templatePath]: `<si-search-bar [maxlength]="max" [value]="term" readonly [debounceTime]="200" />
<si-search-bar [value]="optionalTerm" [showIcon]="true"></si-search-bar>
`
    });

    expect(tree.readContent(templatePath)).toBe(`<si-search-bar>
  <input siSearchBarInput readonly [attr.maxlength]="max" [value]="term" />
</si-search-bar>
<si-search-bar [showIcon]="true">
  <input siSearchBarInput [value]="optionalTerm ?? ''" />
</si-search-bar>
`);
    expect(warnings).toEqual([]);
  });

  it('should replace searchChange with a Signal Forms field', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component, input, output } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-search',
  imports: [SiSearchBarComponent],
  templateUrl: './test.component.html'
})
export class TestComponent {
  readonly loading = input(false);
  readonly searched = output<string>();

  protected search(term: string): void {}
}
`,
      [templatePath]: `<si-search-bar
  colorVariant="base-0"
  prohibitedCharacters="*?"
  placeholder="Search"
  [debounceTime]="300"
  [disabled]="loading()"
  [showIcon]="true"
  (searchChange)="search($event); searched.emit($event)"
/>
`
    });

    expect(tree.readContent(templatePath))
      .toBe(`<si-search-bar colorVariant="base-0" [showIcon]="true">
  <input siSearchBarInput placeholder="Search" [formField]="searchField" />
</si-search-bar>
`);
    expect(tree.readContent(componentPath))
      .toBe(`import { Component, effect, input, output, signal, untracked } from '@angular/core';
import { debounce, disabled, form, FormField, pattern } from '@angular/forms/signals';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-search',
  imports: [SiSearchBarComponent, SiSearchBarInputDirective, FormField],
  templateUrl: './test.component.html'
})
export class TestComponent {
  readonly loading = input(false);
  readonly searched = output<string>();
  protected readonly searchTerm = signal('');
  protected readonly searchField = form(this.searchTerm, path => {
    debounce(path, 300);
    disabled(path, { when: () => this.loading() });
    pattern(path, /^[^*?]*$/);
  });

  constructor() {
    let previousSearchTerm = this.searchTerm();
    effect(() => {
      const searchTerm = this.searchTerm();
      if (searchTerm !== previousSearchTerm && this.searchField().valid()) {
        previousSearchTerm = searchTerm;
        untracked(() => {
          this.search(searchTerm);
          this.searched.emit(searchTerm);
        });
      }
    });
  }

  protected search(term: string): void {}
}
`);
    expect(warnings).toEqual([]);
  });

  it('should extend an existing constructor and avoid name clashes', async () => {
    const { tree } = await runMigration({
      [componentPath]: `import { Component, Injector } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { debounce } from 'lodash';

@Component({
  selector: 'app-filter',
  imports: [SiSearchBarComponent],
  template: \`
    <si-search-bar
      [showIcon]="visible"
      value="Initial"
      maxlength="20"
      readonly
      (searchChange)="term = $event"
    />
  \`
})
export class TestComponent {
  readonly searchTerm = 'taken';
  visible = true;
  term = '';

  constructor(private readonly effect: Injector) {
    console.log(debounce);
  }
}
`
    });

    expect(tree.readContent(componentPath))
      .toBe(`import { Component, effect as ngEffect, Injector, signal, untracked } from '@angular/core';
import {
  debounce as signalFormsDebounce,
  form,
  FormField,
  maxLength,
  readonly
} from '@angular/forms/signals';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { debounce } from 'lodash';

@Component({
  selector: 'app-filter',
  imports: [SiSearchBarComponent, SiSearchBarInputDirective, FormField],
  template: \`
    <si-search-bar [showIcon]="visible">
      <input siSearchBarInput [formField]="searchField2" />
    </si-search-bar>
  \`
})
export class TestComponent {
  readonly searchTerm = 'taken';
  visible = true;
  term = '';
  protected readonly searchTerm2 = signal('Initial');
  protected readonly searchField2 = form(this.searchTerm2, path => {
    signalFormsDebounce(path, 400);
    readonly(path);
    maxLength(path, 20);
  });

  constructor(private readonly effect: Injector) {
    console.log(debounce);

    let previousSearchTerm2 = this.searchTerm2();
    ngEffect(() => {
      const searchTerm2 = this.searchTerm2();
      if (searchTerm2 !== previousSearchTerm2) {
        previousSearchTerm2 = searchTerm2;
        untracked(() => {
          this.term = searchTerm2;
        });
      }
    });
  }
}
`);
  });

  it('should skip search bars whose searchChange output cannot be replaced', async () => {
    const template = `
    @for (column of columns; track column) {
      <si-search-bar (searchChange)="filter(column, $event)" />
    }
    <si-search-bar #bar (searchChange)="filter(bar, $event)" />
    <si-search-bar [debounceTime]="delay" (searchChange)="filter(null, $event)" />
    <si-search-bar [(ngModel)]="term" (searchChange)="filter(null, $event)" />
    <si-search-bar [value]="term" (searchChange)="filter(null, $event)" />
  `;
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [FormsModule, SiSearchBarComponent],
  template: \`${template}\`
})
export class TestComponent {
  columns = ['name'];
  delay = 100;
  term = '';
  filter(column: unknown, term: string): void {}
}
`
    });

    expect(tree.readContent(componentPath)).toContain(template);
    expect(warnings).toEqual([
      'projects/app/src/test.component.ts:10:7: Skipped si-search-bar. It is inside a `@for` block, so one Signal Forms field cannot replace its `(searchChange)` output. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.',
      'projects/app/src/test.component.ts:12:5: Skipped si-search-bar. Its `(searchChange)` handler uses the template variable `bar`. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.',
      'projects/app/src/test.component.ts:13:5: Skipped si-search-bar. Its `debounceTime` is not a constant number. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.',
      'projects/app/src/test.component.ts:14:5: Skipped si-search-bar. It uses `(searchChange)` together with a form binding. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.',
      'projects/app/src/test.component.ts:15:5: Skipped si-search-bar. Its `value` input is not a constant string. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.'
    ]);
  });

  it.each(['inline', 'external'])(
    'should preserve template narrowing in %s templates and generate valid code',
    async templateKind => {
      const guardedTemplate = `@if (user) {
  <si-search-bar (searchChange)="search(user.id, $event)" />
}
@if (!user) {
} @else if (user.id) {
  <si-search-bar (searchChange)="search(user.id, $event)" />
}
@if (!user) {
} @else {
  <si-search-bar (searchChange)="search(user.id, $event)" />
}
@if (user) {
  <section>
    <si-search-bar (searchChange)="search(user.id, $event)" />
  </section>
}
<si-search-bar *ngIf="user" (searchChange)="search(user.id, $event)" />
<ng-container *ngIf="user">
  <si-search-bar (searchChange)="search(user.id, $event)" />
</ng-container>
@switch (selection.kind) {
  @case ('user') {
    <si-search-bar (searchChange)="search(selection.id, $event)" />
  }
}
@switch (selection.kind) {
  @case ('none') {}
  @default {
    <si-search-bar (searchChange)="search(selection.id, $event)" />
  }
}`;
      const template = `${guardedTemplate}
<si-search-bar (searchChange)="search('all', $event)" />`;
      const { tree, warnings } = await runMigration({
        [componentPath]: `import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [NgIf, SiSearchBarComponent],
  ${
    templateKind === 'inline' ? `template: \`${template}\`` : `templateUrl: './test.component.html'`
  }
})
export class TestComponent {
  user?: { id: string };
  selection: { kind: 'user'; id: string } | { kind: 'none' } = { kind: 'none' };
  search(id: string, term: string): void {}
}
`,
        ...(templateKind === 'external' ? { [templatePath]: template } : {})
      });

      expect(getComponentDiagnostics(tree)).toEqual([]);
      expect(tree.readContent(templateKind === 'inline' ? componentPath : templatePath)).toContain(
        guardedTemplate
      );
      expect(tree.readContent(componentPath)).toContain("this.search('all', searchTerm)");
      expect(warnings).toEqual(
        ['@if', '@else if', '@else', '@if', '*ngIf', '*ngIf', '@switch', '@switch'].map(guard =>
          expect.stringContaining(
            guard.startsWith('@')
              ? `It is inside a \`${guard}\` block, where its \`(searchChange)\` handler may depend on template type narrowing. Migrate it manually`
              : `It is inside an element with \`${guard}\`, where its \`(searchChange)\` handler may depend on template type narrowing. Migrate it manually`
          )
        )
      );
    }
  );

  it('should migrate input bindings within template guards without moving them to the class', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [SiSearchBarComponent],
  templateUrl: './test.component.html'
})
export class TestComponent {
  user?: { id: string };
}
`,
      [templatePath]: `@if (user) {
  <si-search-bar [placeholder]="user.id" />
}`
    });

    expect(tree.readContent(templatePath)).toBe(`@if (user) {
  <si-search-bar>
    <input siSearchBarInput [placeholder]="user.id" />
  </si-search-bar>
}`);
    expect(warnings).toEqual([]);
    expect(getComponentDiagnostics(tree)).toEqual([]);
  });

  it('should skip searchChange when no constructor can be added', async () => {
    const { tree, warnings } = await runMigration({
      '/projects/app/src/base.ts': `export abstract class Base {
  constructor(protected readonly id: string) {}
}
`,
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

import { Base } from './base';

@Component({
  selector: 'app-test',
  imports: [SiSearchBarComponent],
  template: '<si-search-bar (searchChange)="search($event)" />'
})
export class TestComponent extends Base {
  search(term: string): void {}
}
`
    });

    expect(tree.readContent(componentPath)).toContain(
      `template: '<si-search-bar (searchChange)="search($event)" />'`
    );
    expect(warnings).toEqual([
      'projects/app/src/test.component.ts:9:14: Skipped si-search-bar. Its `(searchChange)` output is replaced with a Signal Forms field in the component class, but no constructor can be added because the base class constructor requires arguments. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.'
    ]);
  });

  it('should call super when adding a constructor to a derived component', async () => {
    const { tree } = await runMigration({
      '/projects/app/src/base.ts': `export abstract class Base {}
`,
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

import { Base } from './base';

@Component({
  selector: 'app-test',
  imports: [SiSearchBarComponent],
  template: '<si-search-bar [debounceTime]="0" (searchChange)="search($event)" />'
})
export class TestComponent extends Base {
  search(term: string): void {}
}
`
    });

    const component = tree.readContent(componentPath);
    expect(component).toContain(
      `template: '<si-search-bar><input siSearchBarInput [formField]="searchField" /></si-search-bar>'`
    );
    expect(component).toContain(`export class TestComponent extends Base {
  protected readonly searchTerm = signal('');
  protected readonly searchField = form(this.searchTerm);

  constructor() {
    super();
    let previousSearchTerm = this.searchTerm();
    effect(() => {
      const searchTerm = this.searchTerm();
      if (searchTerm !== previousSearchTerm) {
        previousSearchTerm = searchTerm;
        untracked(() => this.search(searchTerm));
      }
    });
  }

  search(term: string): void {}
}`);
  });

  it('should skip unsupported combinations with form bindings', async () => {
    const template = `
    <si-search-bar placeholder="Name" [formField]="search" />
    <si-search-bar [disabled]="true" [formField]="search" />
    <si-search-bar prohibitedCharacters="*" [formField]="search" />
  `;
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [FormField, SiSearchBarComponent],
  template: \`${template}\`
})
export class TestComponent {
  readonly search = form(signal(''));
}
`
    });

    const component = tree.readContent(componentPath);
    expect(component).toContain(`<si-search-bar>
      <input siSearchBarInput placeholder="Name" [formField]="search" />
    </si-search-bar>
    <si-search-bar [disabled]="true" [formField]="search" />
    <si-search-bar prohibitedCharacters="*" [formField]="search" />`);
    expect(warnings.slice(1)).toEqual([
      'projects/app/src/test.component.ts:10:5: Skipped si-search-bar. Signal Forms do not allow `disabled` on an input with `[formField]`. Configure them in the form schema instead. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.',
      'projects/app/src/test.component.ts:11:5: Skipped si-search-bar. It uses `prohibitedCharacters` together with a form binding. Add a pattern validator to the form control and ignore invalid values instead. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.'
    ]);
  });

  it('should add the input directive to the NgModule of a non-standalone component', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html'
})
export class TestComponent {
  term = '';
}
`,
      [templatePath]: `<si-search-bar placeholder="Name" [debounceTime]="0" [(ngModel)]="term" />
<si-search-bar (searchChange)="term = $event" />
`,
      '/projects/app/src/test.module.ts': `import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

import { TestComponent } from './test.component';

@NgModule({
  declarations: [TestComponent],
  imports: [FormsModule, SiSearchBarComponent]
})
export class TestModule {}
`
    });

    expect(tree.readContent(templatePath)).toBe(`<si-search-bar>
  <input siSearchBarInput placeholder="Name" [(ngModel)]="term" />
</si-search-bar>
<si-search-bar (searchChange)="term = $event" />
`);
    const ngModule = tree.readContent('/projects/app/src/test.module.ts');
    expect(ngModule).toContain(
      `import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';`
    );
    expect(ngModule).toContain(
      'imports: [FormsModule, SiSearchBarComponent, SiSearchBarInputDirective]'
    );
    expect(warnings).toEqual([
      'projects/app/src/test.component.html:2:1: Skipped si-search-bar. Its `(searchChange)` output is replaced with a Signal Forms field in the component class, but it is declared in an NgModule. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.'
    ]);
  });

  it('should warn if the NgModule of a non-standalone component is not found', async () => {
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: false,
  template: '<si-search-bar placeholder="Name" />'
})
export class TestComponent {}
`
    });

    expect(tree.readContent(componentPath)).toContain(
      `template: '<si-search-bar><input siSearchBarInput placeholder="Name" /></si-search-bar>'`
    );
    expect(warnings).toEqual([
      'projects/app/src/test.component.ts: TestComponent is declared in an NgModule that was not found. Add SiSearchBarInputDirective to the imports of that NgModule.'
    ]);
  });

  it('should migrate a template that is shared by several components once', async () => {
    const sharedTemplatePath = '/projects/app/src/shared.html';
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({ selector: 'app-a', imports: [SiSearchBarComponent], templateUrl: './shared.html' })
export class AComponent {
  search(term: string): void {}
}

@Component({ selector: 'app-b', imports: [SiSearchBarComponent], templateUrl: './shared.html' })
export class BComponent {
  search(term: string): void {}
}
`,
      [sharedTemplatePath]: `<si-search-bar placeholder="Shared" />
<si-search-bar (searchChange)="search($event)" />
`
    });

    expect(tree.readContent(sharedTemplatePath)).toBe(`<si-search-bar>
  <input siSearchBarInput placeholder="Shared" />
</si-search-bar>
<si-search-bar (searchChange)="search($event)" />
`);
    expect(
      tree.readContent(componentPath).match(/SiSearchBarComponent, SiSearchBarInputDirective/g)
    ).toHaveLength(3);
    expect(warnings).toEqual([
      'projects/app/src/shared.html:2:1: Skipped si-search-bar. Its `(searchChange)` output is replaced with a Signal Forms field in the component class, but its template is used by several components. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.'
    ]);
  });

  it('should escape generated code in string literal templates', async () => {
    const { tree } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarModule } from '@simpl/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [SiSearchBarModule],
  template: "<si-search-bar placeholder='Find' [value]='term' />"
})
export class TestComponent {
  term?: string;
}
`
    });

    const component = tree.readContent(componentPath);
    expect(component).toContain(
      `template: "<si-search-bar><input siSearchBarInput placeholder='Find' [value]='term ?? \\"\\"' /></si-search-bar>"`
    );
    expect(component).toContain('imports: [SiSearchBarModule]');
    expect(component).not.toContain('SiSearchBarInputDirective');
  });

  it('should skip a component whose imports cannot be updated', async () => {
    const template = `<si-search-bar placeholder="Name" />`;
    const { tree, warnings } = await runMigration({
      [componentPath]: `import { Component } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

const IMPORTS = [SiSearchBarComponent];

@Component({
  selector: 'app-test',
  imports: IMPORTS,
  template: '${template}'
})
export class TestComponent {}
`
    });

    expect(tree.readContent(componentPath)).toContain(`template: '${template}'`);
    expect(warnings).toEqual([
      'projects/app/src/test.component.ts:9:14: Skipped si-search-bar. `SiSearchBarInputDirective` cannot be added to the component imports because its `imports` property is not an array literal. Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.'
    ]);
  });

  it('should not touch search bars without deprecated usages and be idempotent', async () => {
    const files = {
      [componentPath]: `import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';

@Component({
  selector: 'app-test',
  imports: [FormField, SiSearchBarComponent],
  templateUrl: './test.component.html'
})
export class TestComponent {
  readonly search = form(signal(''));
  find(term: string): void {}
}
`,
      [templatePath]: `<si-search-bar [showIcon]="true" />
<si-search-bar placeholder="Ignored">
  <input siSearchBarInput [formField]="search" />
</si-search-bar>
<si-search-bar placeholder="Find" (searchChange)="find($event)" />
`
    };
    const { tree, warnings } = await runMigration(files);
    const migratedTemplate = tree.readContent(templatePath);
    const migratedComponent = tree.readContent(componentPath);

    expect(migratedTemplate).toBe(`<si-search-bar [showIcon]="true" />
<si-search-bar placeholder="Ignored">
  <input siSearchBarInput [formField]="search" />
</si-search-bar>
<si-search-bar>
  <input siSearchBarInput placeholder="Find" [formField]="searchField" />
</si-search-bar>
`);
    expect(warnings).toEqual([
      'projects/app/src/test.component.html:2:1: Skipped si-search-bar. It already projects an input with `siSearchBarInput`. Move its remaining deprecated inputs and outputs to that input manually.'
    ]);

    const rerun = await runner.runSchematic(
      'migrate-search-bar',
      { path: 'projects/app/src' },
      tree
    );
    expect(rerun.readContent(templatePath)).toBe(migratedTemplate);
    expect(rerun.readContent(componentPath)).toBe(migratedComponent);
  });
});
