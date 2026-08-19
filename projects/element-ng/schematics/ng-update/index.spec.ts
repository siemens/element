/**
 * Copyright (c) Siemens 2016 - 2026
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
    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    expect(tree).toBeDefined();
  });

  it('should log migration start message', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);

    await runner.runSchematic('migration-v51', {}, appTree);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Starting update from version 49 to 51')
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

    const tree = await runner.runSchematic('migration-v51', {}, appTree);

    expect(tree).toBeDefined();
    expect(tree.exists('/projects/app/src/test.component.ts')).toBe(true);
    const modifiedContent = tree.readContent('/projects/app/src/test.component.ts');
    expect(modifiedContent).toEqual(originalContent);
  });

  it('should handle empty project gracefully', async () => {
    const emptyTree = await createTestApp(runner, { style: 'scss' });

    const tree = await runner.runSchematic('migration-v51', {}, emptyTree);
    expect(tree).toBeDefined();
  });

  it('should remove provideIconConfig usage and its import', async () => {
    const originalContent = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideIconConfig } from '@siemens/element-ng/icon';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideIconConfig({ disableSvgIcons: true })]
};`;

    addTestFiles(appTree, {
      '/projects/app/src/app.config.ts': originalContent
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);

    const modifiedContent = tree.readContent('/projects/app/src/app.config.ts');
    expect(modifiedContent).not.toContain('provideIconConfig');
    expect(modifiedContent).not.toContain('@siemens/element-ng/icon');
    expect(modifiedContent).toContain('providers: [provideZonelessChangeDetection()]');
  });

  it('should remove the deprecated si-search-bar tabbable input', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/search.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  template: \`<si-search-bar [tabbable]="false" placeholder="Search" />\`
})
export class SearchComponent {}`,
      '/projects/app/src/external-search.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-external-search',
  templateUrl: './search.component.html'
})
export class ExternalSearchComponent {}`,
      '/projects/app/src/search.component.html': `<si-search-bar tabbable="false" />
<div tabbable="false"></div>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/search.component.ts');
    const template = tree.readContent('/projects/app/src/search.component.html');

    expect(component).not.toContain('tabbable');
    expect(component).toContain('placeholder="Search"');
    expect(template).not.toContain('si-search-bar tabbable');
    expect(template).toContain('<div tabbable="false"></div>');
  });

  it('should move literal split sizes to inline split parts', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split [sizes]="[20, 60, 30]">
  <si-split-part>Left</si-split-part>
  <si-split-part>Center</si-split-part>
  <si-split-part>Right</si-split-part>
</si-split>\`
})
export class SplitComponent {}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.ts');

    expect(modifiedContent).not.toContain('[sizes]');
    expect(modifiedContent).toContain('<si-split-part size="20" unit="fr"');
    expect(modifiedContent).toContain('<si-split-part size="60" unit="fr"');
    expect(modifiedContent).toContain('<si-split-part size="30" unit="fr"');
  });

  it('should move expression split sizes to external split parts', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html'
})
export class SplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split [sizes]="panelSizes">
  <si-split-part>Left</si-split-part>
  <si-split-part>Right</si-split-part>
</si-split>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.html');

    expect(modifiedContent).not.toContain('[sizes]');
    expect(modifiedContent).toContain('<si-split-part [size]="panelSizes[0]" unit="fr"');
    expect(modifiedContent).toContain('<si-split-part [size]="panelSizes[1]" unit="fr"');
  });

  it('should replace an AI message content formatter with si-markdown in an external template', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/ai-message.component.ts': `import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiAiMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-ai-message',
  imports: [SiAiMessageComponent],
  templateUrl: './ai-message.component.html'
})
export class AiMessageComponent {
  readonly markdownRenderer = getMarkdownRenderer(inject(DomSanitizer));
  readonly response = 'This is **bold**';
}`,
      '/projects/app/src/ai-message.component.html': `<si-ai-message
  [content]="response"
  [contentFormatter]="markdownRenderer"
  [actions]="actions"
/>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/ai-message.component.ts');
    const template = tree.readContent('/projects/app/src/ai-message.component.html');

    expect(component).toBe(`import { Component, inject } from '@angular/core';
import { SiAiMessageComponent } from '@siemens/element-ng/chat-messages';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

@Component({
  selector: 'app-ai-message',
  imports: [SiAiMessageComponent, SiMarkdownComponent],
  templateUrl: './ai-message.component.html'
})
export class AiMessageComponent {
  readonly response = 'This is **bold**';
}`);
    expect(template).toBe(`<si-ai-message
  [actions]="actions"><si-markdown [markdown]="response" /></si-ai-message>`);
  });

  it('should replace a user message content formatter with si-markdown in an inline template', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/user-message.component.ts': `import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiUserMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-user-message',
  imports: [SiUserMessageComponent],
  template: \`<si-user-message [content]="message" [contentFormatter]="markdownRenderer" />\`
})
export class UserMessageComponent {
  readonly markdownRenderer = getMarkdownRenderer(inject(DomSanitizer));
  readonly message = 'A **markdown** message';
}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/user-message.component.ts');

    expect(component).toBe(`import { Component, inject } from '@angular/core';
import { SiUserMessageComponent } from '@siemens/element-ng/chat-messages';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

@Component({
  selector: 'app-user-message',
  imports: [SiUserMessageComponent, SiMarkdownComponent],
  template: \`<si-user-message><si-markdown [markdown]="message" /></si-user-message>\`
})
export class UserMessageComponent {
  readonly message = 'A **markdown** message';
}`);
  });

  it('should retain DomSanitizer when another member still uses it', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/user-message.component.ts': `import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiUserMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-user-message',
  imports: [SiUserMessageComponent],
  template: \`<si-user-message [content]="message" [contentFormatter]="markdownRenderer" />\`
})
export class UserMessageComponent {
  readonly sanitizer = inject(DomSanitizer);
  readonly markdownRenderer = getMarkdownRenderer(this.sanitizer);
  readonly message = 'A **markdown** message';
}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/user-message.component.ts');

    expect(component).toContain("import { DomSanitizer } from '@angular/platform-browser';");
    expect(component).toContain('readonly sanitizer = inject(DomSanitizer);');
    expect(component).not.toContain('getMarkdownRenderer');
    expect(component).not.toContain('readonly markdownRenderer');
  });

  it('should pass options to sub-migrations', async () => {
    const customPath = '/custom/path';
    const options = { path: customPath };

    const tree = await runner.runSchematic('migration-v51', options, appTree);
    expect(tree).toBeDefined();

    // Verify the schematic ran with custom options
    // In a real scenario, you'd verify the migration respected the path option
  });

  it('should add unit="px" to a split part with a literal size but no unit (inline template)', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split>
  <si-split-part size="300">Left</si-split-part>
  <si-split-part size="200">Right</si-split-part>
</si-split>\`
})
export class SplitComponent {}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.ts');

    expect(modifiedContent).toContain('<si-split-part size="300" unit="px"');
    expect(modifiedContent).toContain('<si-split-part size="200" unit="px"');
  });

  it('should add unit="px" to a split part with a bound size but no unit (external template)', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html'
})
export class SplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split>
  <si-split-part [size]="leftSize">Left</si-split-part>
  <si-split-part [size]="rightSize">Right</si-split-part>
</si-split>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.html');

    expect(modifiedContent).toContain('<si-split-part [size]="leftSize" unit="px"');
    expect(modifiedContent).toContain('<si-split-part [size]="rightSize" unit="px"');
  });

  it('should not add unit="px" when unit is already present', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.html': `<si-split>
  <si-split-part size="20" unit="fr">Left</si-split-part>
  <si-split-part [size]="rightSize" [unit]="unitVal">Right</si-split-part>
</si-split>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.html');

    expect(modifiedContent).toContain('<si-split-part size="20" unit="fr"');
    expect(modifiedContent).toContain('<si-split-part [size]="rightSize" [unit]="unitVal"');
  });

  it('should add unit="fr" when converting [sizes] and not duplicate with unit="px"', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html'
})
export class SplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split [sizes]="[30, 70]">
  <si-split-part>Left</si-split-part>
  <si-split-part>Right</si-split-part>
</si-split>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.html');

    expect(modifiedContent).not.toContain('[sizes]');
    expect(modifiedContent).toContain('<si-split-part size="30" unit="fr"');
    expect(modifiedContent).toContain('<si-split-part size="70" unit="fr"');
    expect(modifiedContent).not.toContain('unit="px"');
  });

  it('should add unit="px" to a self-closing split part with a size but no unit', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html'
})
export class SplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split>
  <si-split-part size="400" heading="Left" />
  <si-split-part size="200" heading="Right" />
</si-split>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.html');

    expect(modifiedContent).toContain('<si-split-part size="400" heading="Left"  unit="px"');
    expect(modifiedContent).toContain('<si-split-part size="200" heading="Right"  unit="px"');
  });

  it('should rename split collapse bindings and CollapseTo literals', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component, signal } from '@angular/core';
import { CollapseTo } from '@siemens/element-ng/split';

@Component({
  selector: 'app-split',
  template: \`<si-split-part collapseDirection="start" [collapseDirection]="'end'" />\`
})
export class SplitComponent {
  readonly direction = signal<CollapseTo>('start');
  currentDirection: CollapseTo = 'end';

  toggle(): void {
    this.direction.set('end');
    this.currentDirection = 'start';
  }
}`,
      '/projects/app/src/external-split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-external-split',
  templateUrl: './split.component.html'
})
export class ExternalSplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split-part collapseDirection="end" />
<div collapseDirection="start"></div>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/split.component.ts');
    const template = tree.readContent('/projects/app/src/split.component.html');

    expect(component).toContain('collapsible="to-start"');
    expect(component).toContain(`[collapsible]="'to-end'"`);
    expect(component).toContain(`signal<CollapseTo>('to-start')`);
    expect(component).toContain(`this.direction.set('to-end')`);
    expect(component).toContain(`currentDirection: CollapseTo = 'to-end'`);
    expect(component).toContain(`this.currentDirection = 'to-start'`);
    expect(template).toContain('<si-split-part collapsible="to-end" />');
    expect(template).toContain('<div collapseDirection="start"></div>');
  });

  it('should add the former default collapse direction to collapsible split parts', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split-part />
<si-split-part showCollapseButton />
<si-split-part showCollapseButton="true" />
<si-split-part [showCollapseButton]="true" />\`
})
export class SplitComponent {}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/split.component.ts');

    expect(component).not.toContain('showCollapseButton');
    expect(component.match(/collapsible="to-start"/g)).toHaveLength(4);
  });

  it('should remove false collapse buttons and their legacy directions', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split-part showCollapseButton="false" collapseDirection="start" />
<si-split-part [showCollapseButton]="'false'" [collapseDirection]="'end'" />
<si-split-part showCollapseButton="false" />\`
})
export class SplitComponent {}`,
      '/projects/app/src/external-split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-external-split',
  templateUrl: './split.component.html'
})
export class ExternalSplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split-part
  heading="Details"
  [showCollapseButton]="false"
  [collapseDirection]="'end'"
>
  <p>Content</p>
</si-split-part>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/split.component.ts');
    const template = tree.readContent('/projects/app/src/split.component.html');

    expect(component).not.toContain('showCollapseButton');
    expect(component).not.toContain('collapseDirection');
    expect(component).not.toContain('collapsible');
    expect(template).toBe(`<si-split-part
  heading="Details"
>
  <p>Content</p>
</si-split-part>`);
  });

  it('should conditionally migrate dynamic collapse button bindings', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split-part [showCollapseButton]="canCollapse" />
<si-split-part [showCollapseButton]="canCollapse" collapseDirection="end" />
<si-split-part [showCollapseButton]="canCollapse" [collapseDirection]="direction" />
<div [showCollapseButton]="canCollapse"></div>\`
})
export class SplitComponent {
  readonly canCollapse = false;
  readonly direction = 'end';
}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/split.component.ts');

    const condition = `![false, null, undefined, 'false'].includes($any(canCollapse))`;
    expect(component).toContain(`[collapsible]="${condition} ? 'to-start' : undefined"`);
    expect(component).toContain(`[collapsible]="${condition} ? 'to-end' : undefined"`);
    expect(component).toContain(`[collapsible]="${condition} ? (direction) : undefined"`);
    expect(component).toContain('<div [showCollapseButton]="canCollapse"></div>');
    expect(component.match(/showCollapseButton/g)).toHaveLength(1);
    expect(component).not.toContain('collapseDirection');
  });

  it('should preserve an explicit collapsible input when removing showCollapseButton=false', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split-part showCollapseButton="false" collapsible="to-end" />\`
})
export class SplitComponent {}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const component = tree.readContent('/projects/app/src/split.component.ts');

    expect(component).toBe(`import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split-part collapsible="to-end" />\`
})
export class SplitComponent {}`);
  });
});
