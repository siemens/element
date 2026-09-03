/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);
const componentPath = '/projects/app/src/test.component.ts';
const templatePath = '/projects/app/src/test.component.html';

describe('legacy tabs migration', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('@siemens/element-ng', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const runMigration = async (): Promise<UnitTestTree> =>
    runner.runSchematic('migrate-tabs-legacy', { path: 'projects/app/src' }, appTree);

  it('should distribute a selected index expression across external template tabs', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  templateUrl: './test.component.html'
})
export class TestComponent {
  selectedTabIndex = 0;
  changedTab(index: number): void {}
}`,
      [templatePath]: `<si-tabset-legacy
  [selectedTabIndex]="selectedTabIndex"
  (selectedTabIndexChange)="changedTab($event)"
>
  <si-tab-legacy icon="element-favorite" iconAltText="Favorites">Favorite</si-tab-legacy>
  <si-tab-legacy heading="Recent">Recent</si-tab-legacy>
</si-tabset-legacy>`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);
    const template = tree.readContent(templatePath);

    expect(component).toContain(
      `import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';`
    );
    expect(component).toContain('imports: [SiTabComponent, SiTabsetComponent]');
    expect(component).not.toContain('tabs-legacy');
    expect(template).toContain('<si-tabset');
    expect(template).not.toContain('[selectedTabIndex]');
    expect(template).not.toContain('(selectedTabIndexChange)');
    expect(template).toContain(
      `<si-tab [active]="selectedTabIndex === 0" (activeChange)="$event && (changedTab(0))" icon="element-favorite" heading="Favorites">`
    );
    expect(template).toContain(
      `<si-tab [active]="selectedTabIndex === 1" (activeChange)="$event && (changedTab(1))" heading="Recent">`
    );
  });

  it('should preserve two-way selected index updates in an inline template', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy [(selectedTabIndex)]="selectedTabIndex">
    <si-tab-legacy heading="One">One</si-tab-legacy>
    <si-tab-legacy heading="Two">Two</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {
  selectedTabIndex = 0;
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain(
      `<si-tab [active]="selectedTabIndex === 0" (activeChange)="$event && (selectedTabIndex = 0)" heading="One">`
    );
    expect(component).toContain(
      `<si-tab [active]="selectedTabIndex === 1" (activeChange)="$event && (selectedTabIndex = 1)" heading="Two">`
    );
  });

  it('should migrate literal and default selection states', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabsLegacyModule } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabsLegacyModule],
  template: \`<si-tabset-legacy selectedTabIndex="1">
    <si-tab-legacy heading="One">One</si-tab-legacy>
    <si-tab-legacy heading="Two">Two</si-tab-legacy>
  </si-tabset-legacy>
  <si-tabset-legacy>
    <si-tab-legacy heading="Default">Default</si-tab-legacy>
  </si-tabset-legacy>
  <si-tabset-legacy selectDefaultTab="false">
    <si-tab-legacy heading="None">None</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain(
      `import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';`
    );
    expect(component).toContain('imports: [SiTabComponent, SiTabsetComponent]');
    expect(component).toContain('<si-tab [active]="true" heading="Two">');
    expect(component).toContain('<si-tab [active]="true" heading="Default">');
    expect(component).toContain('<si-tab heading="None">');
    expect(component).not.toContain('selectDefaultTab');
  });

  it('should use the loop index for tabs in a simple for block', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy [(selectedTabIndex)]="selectedTabIndex">
    @for (tab of tabs; track tab) {
      <si-tab-legacy [heading]="tab.heading">{{ tab.heading }}</si-tab-legacy>
    }
  </si-tabset-legacy>\`
})
export class TestComponent {
  selectedTabIndex = 0;
  tabs = [{ heading: 'One' }];
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain('[active]="selectedTabIndex === $index"');
    expect(component).toContain('(activeChange)="$event && (selectedTabIndex = $index)"');
  });

  it('should migrate router tabs without adding an active input', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [RouterLink, SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy>
    <a si-tab-legacy heading="Home" routerLink="/home"></a>
  </si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain(
      `import { SiTabLinkComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';`
    );
    expect(component).toContain('imports: [RouterLink, SiTabLinkComponent, SiTabsetComponent]');
    expect(component).toContain('<a si-tab heading="Home" routerLink="/home"></a>');
    expect(component).not.toContain('[active]');
  });

  it('should import both tab variants when content and router tabs are mixed', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [RouterLink, SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy>
    <si-tab-legacy heading="Content">Content</si-tab-legacy>
    <a si-tab-legacy heading="Home" routerLink="/home"></a>
  </si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain(
      `import { SiTabComponent, SiTabLinkComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';`
    );
    expect(component).toContain(
      'imports: [RouterLink, SiTabComponent, SiTabLinkComponent, SiTabsetComponent]'
    );
  });

  it('should retain an existing heading and remove iconAltText', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy selectDefaultTab="false">
    <si-tab-legacy heading="Visible" iconAltText="Accessible">Content</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toMatch(/<si-tab heading="Visible"\s*>Content<\/si-tab>/);
    expect(component).not.toContain('iconAltText');
  });

  it('should preserve an existing active binding', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy>
    <si-tab-legacy heading="One" [active]="isActive">One</si-tab-legacy>
    <si-tab-legacy heading="Two">Two</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {
  isActive = false;
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain('[active]="isActive"');
    expect(component).not.toContain('[active]="true" heading="One"');
    expect(
      logSpy.mock.calls.some(([entry]) =>
        (entry.message as string).includes('existing `active` binding was preserved')
      )
    ).toBe(true);
  });

  it('should retain ambiguous index bindings for manual migration', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy [(selectedTabIndex)]="selectedTabIndex">
    <si-tab-legacy *ngSwitchCase="'one'" heading="One">One</si-tab-legacy>
    <si-tab-legacy *ngSwitchDefault heading="Two">Two</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {
  selectedTabIndex = 0;
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain('[(selectedTabIndex)]="selectedTabIndex"');
    expect(component).not.toContain('[active]');
    expect(
      logSpy.mock.calls.some(([entry]) =>
        (entry.message as string).includes('runtime tab positions are ambiguous')
      )
    ).toBe(true);
  });

  it('should preserve the simpl package scope for a legacy module import', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabsLegacyModule } from '@simpl/element-ng/tabs-legacy';

@Component({
  imports: [SiTabsLegacyModule],
  template: \`<si-tabset-legacy>
    <si-tab-legacy heading="One">One</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain(
      `import { SiTabComponent, SiTabsetComponent } from '@simpl/element-ng/tabs';`
    );
    expect(component).not.toContain('@siemens/element-ng/tabs');
  });

  it('should leave router-controlled selection inputs for manual migration', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [RouterLink, SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy [(selectedTabIndex)]="selectedTabIndex">
    <a si-tab-legacy heading="Home" routerLink="/home"></a>
  </si-tabset-legacy>\`
})
export class TestComponent {
  selectedTabIndex = 0;
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain('[(selectedTabIndex)]="selectedTabIndex"');
    expect(component).not.toContain('[active]');
    expect(
      logSpy.mock.calls.some(([entry]) =>
        (entry.message as string).includes('active state is derived from the Angular router')
      )
    ).toBe(true);
  });

  it('should warn when a close handler consumes the removed event payload', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy>
    <si-tab-legacy heading="One" (closeTriggered)="close($event)">One</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    await runMigration();

    expect(
      logSpy.mock.calls.some(([entry]) =>
        (entry.message as string).includes('no longer emits the tab component')
      )
    ).toBe(true);
  });

  it('should normalize a bound iconAltText input to heading', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy selectDefaultTab="false">
    <si-tab-legacy bind-iconAltText="label">Content</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {
  label = 'One';
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);

    expect(component).toContain('<si-tab [heading]="label">Content</si-tab>');
  });

  it('should warn when deselection and tab positions require manual migration', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy [selectedTabIndex]="selectedTabIndex" (deselect)="deselection($event)">
    @if (showFirst) {
      <si-tab-legacy>One</si-tab-legacy>
    }
    <si-tab-legacy heading="Two">Two</si-tab-legacy>
  </si-tabset-legacy>\`
})
export class TestComponent {
  selectedTabIndex = 0;
  showFirst = true;
}`
    });

    const tree = await runMigration();
    const component = tree.readContent(componentPath);
    const warnings = logSpy.mock.calls.map(([entry]) => entry.message as string);

    expect(component).not.toContain('deselect');
    expect(component).toContain('[selectedTabIndex]="selectedTabIndex"');
    expect(warnings.some(message => message.includes('canDeactivate'))).toBe(true);
    expect(warnings.some(message => message.includes('runtime tab positions are ambiguous'))).toBe(
      true
    );
    expect(warnings.some(message => message.includes('requires a `heading` input'))).toBe(true);
  });

  it('should be idempotent', async () => {
    addTestFiles(appTree, {
      [componentPath]: `import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@siemens/element-ng/tabs-legacy';

@Component({
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: \`<si-tabset-legacy><si-tab-legacy heading="One">One</si-tab-legacy></si-tabset-legacy>\`
})
export class TestComponent {}`
    });

    const firstTree = await runMigration();
    const firstResult = firstTree.readContent(componentPath);
    appTree = firstTree;
    const secondTree = await runMigration();

    expect(secondTree.readContent(componentPath)).toBe(firstResult);
  });
});
