/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';

import type { ApiPresentation } from './normalization/model.ts';
import type { ReferencePlan } from './normalization/reference-plan.ts';

const cli = fileURLToPath(new URL('./bin/angular-api-docs.ts', import.meta.url));
const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url));
const extract = (config: string) =>
  spawnSync(process.execPath, [cli, 'extract', '--config', config], { encoding: 'utf8' });

let workDir: string;
let documentation: ApiPresentation;
let catalog: { referencePages: Pick<ReferencePlan, 'pages'> };

const readOutput = (file: string) => readFile(path.join(workDir, 'output', file), 'utf8');

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'angular-api-docs-'));
  const config = path.join(workDir, 'api-docs.config.mjs');
  await writeFile(
    config,
    `export default ${JSON.stringify({
      root: fixtures,
      packages: ['library'],
      output: { dir: path.join(workDir, 'output') },
      reference: { dir: 'reference' }
    })};`
  );

  const result = extract(config);
  expect(result.status, result.stderr).toBe(0);
  documentation = JSON.parse(await readOutput('api-documentation.json'));
  catalog = JSON.parse(await readOutput('api-reference-pages.json'));
});

afterAll(async () => {
  if (workDir) {
    await rm(workDir, { recursive: true, force: true });
  }
});

it('documents a required signal input by its public alias and hides internal members', () => {
  const widget = documentation.symbols.find(symbol => symbol.name === 'WidgetComponent')!;
  const inputs = widget.api.groups.find(group => group.kind === 'inputs')!;

  expect(inputs.rows).toContainEqual(
    expect.objectContaining({ name: 'heading', badges: expect.arrayContaining(['required']) })
  );
  expect(widget.api.groups.flatMap(group => group.rows.map(row => row.name))).not.toContain(
    'internalState'
  );
});

it('documents a secondary entry point and adds its page to the reference catalog', () => {
  const referencePath = 'reference/fixture/library/components/WidgetComponent.md';

  expect(documentation.symbols).toContainEqual(
    expect.objectContaining({
      name: 'WidgetComponent',
      importPath: '@fixture/library/widgets',
      referencePath
    })
  );
  expect(catalog.referencePages.pages).toContainEqual(
    expect.objectContaining({ kind: 'symbol', path: referencePath, name: 'WidgetComponent' })
  );
});

it('displays public names while linking aliased types to their own declarations', () => {
  const widget = documentation.symbols.find(symbol => symbol.name === 'WidgetComponent')!;
  const input = widget.api.groups
    .find(group => group.kind === 'inputs')!
    .rows.find(row => row.name === 'menuItems')!;

  expect(input.type.filter(part => part.kind === 'link')).toEqual([
    expect.objectContaining({ text: 'MenuItem', targetId: '@fixture/library#MenuItem' }),
    expect.objectContaining({ text: 'MenuItem', targetId: '@fixture/library/menu#MenuItem' })
  ]);
  expect(widget.api.relatedTypeIds).toEqual(
    expect.arrayContaining([
      '@fixture/library#MenuItem',
      '@fixture/library/menu#MenuItem',
      '@fixture/library/widgets#DEFAULT_WIDGET_TITLE',
      '@fixture/library/widgets#WidgetChangeEvent',
      '@fixture/library/widgets#ExtendedWidgetMap'
    ])
  );

  const menu = documentation.symbols.find(symbol => symbol.id === '@fixture/library#MenuItem')!;
  const action = menu.type.groups.flatMap(group => group.rows).find(row => row.name === 'action')!;
  expect(action.type.map(part => part.text).join('')).toBe(
    'string | ((param: string) => void | undefined)'
  );
});

it.each([
  { name: 'WidgetTitleService', providedInRoot: true },
  { name: 'WidgetSettingsService', providedInRoot: false },
  { name: 'WidgetStateService', providedInRoot: true }
])('documents provider scope for $name', ({ name, providedInRoot }) => {
  const referencePath = `reference/fixture/library/injectables/${name}.md`;

  expect(documentation.symbols.find(symbol => symbol.name === name)).toMatchObject({
    referencePath,
    metadata: providedInRoot ? [{ label: 'Provided in', value: 'root' }] : []
  });
  expect(catalog.referencePages.pages).toContainEqual(
    expect.objectContaining({ kind: 'symbol', category: 'injectables', path: referencePath, name })
  );
});

it('omits inherited index signatures while keeping directly declared ones', () => {
  const label = documentation.symbols.find(symbol => symbol.name === 'WidgetLabel')!;
  const labels = documentation.symbols.find(symbol => symbol.name === 'WidgetLabels')!;
  const map = documentation.symbols.find(symbol => symbol.name === 'WidgetMap')!;
  const extended = documentation.symbols.find(symbol => symbol.name === 'ExtendedWidgetMap')!;
  const alias = documentation.symbols.find(symbol => symbol.name === 'WidgetMapAlias')!;

  expect(label.api.groups).toEqual([]);
  expect(label.type.groups).toEqual([]);
  expect(labels.api.groups).toEqual([]);
  expect(labels.type.groups).toEqual([]);
  expect(extended.api.groups.map(group => group.kind)).not.toContain('index_signatures');
  expect(extended.type.groups.map(group => group.kind)).not.toContain('index_signatures');
  expect(alias.api.groups.map(group => group.kind)).not.toContain('index_signatures');
  expect(alias.type.groups.map(group => group.kind)).not.toContain('index_signatures');
  expect(map.api.groups).toContainEqual(
    expect.objectContaining({
      kind: 'index_signatures',
      rows: [expect.objectContaining({ name: '[key: string]' })]
    })
  );
});

it('prefers host-directive binding docs and defaults over re-exposed class properties', () => {
  const widget = documentation.symbols.find(symbol => symbol.name === 'WidgetComponent')!;
  const inputs = widget.api.groups.find(group => group.kind === 'inputs')!;
  const outputs = widget.api.groups.find(group => group.kind === 'outputs')!;
  const readonlyInput = inputs.rows.find(row => row.name === 'readonly');
  const colorInput = inputs.rows.find(row => row.name === 'color');
  const openChangeOutput = outputs.rows.find(row => row.name === 'openChange');
  const textOf = (row: typeof readonlyInput) =>
    row?.documentation
      .flatMap(block => ('parts' in block ? block.parts.map(p => p.text) : []))
      .join('') ?? '';

  expect(readonlyInput).toMatchObject({ name: 'readonly', default: 'false' });
  expect(textOf(readonlyInput)).toContain('Readonly state from the host directive.');
  expect(openChangeOutput).toMatchObject({ name: 'openChange' });
  expect(textOf(openChangeOutput)).toContain('Emits when the host directive toggles open state.');
  expect(colorInput).toMatchObject({ name: 'color', default: "'primary'" });
  expect(textOf(colorInput)).toContain(
    'Component-specific color input overriding the host directive docs.'
  );
});

it('keeps the inherited label default in both documentation views', () => {
  const options = documentation.symbols.find(symbol => symbol.name === 'WidgetOptions')!;

  expect(options.api.groups.flatMap(group => group.rows)).toContainEqual(
    expect.objectContaining({ name: 'label', default: "''" })
  );
  expect(options.type.groups.flatMap(group => group.rows)).toContainEqual(
    expect.objectContaining({ name: 'label', default: "''" })
  );
});

it('shows public methods but not protected hooks in either documentation view', () => {
  const widget = documentation.symbols.find(symbol => symbol.name === 'WidgetComponent')!;

  for (const [viewName, view] of Object.entries({ api: widget.api, type: widget.type })) {
    const names = view.groups.flatMap(group => group.rows.map(row => row.name));
    expect(names, viewName).toContain('refresh');
    expect(names, viewName).not.toContain('updateDisplay');
  }
});

it('reports a missing package without replacing either previously generated file', async () => {
  const files = ['api-documentation.json', 'api-reference-pages.json'];
  const before = await Promise.all(files.map(readOutput));
  const config = path.join(workDir, 'invalid.config.mjs');
  await writeFile(config, `export default { packages: ['missing'], output: { dir: 'output' } };`);

  const result = extract(config);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Package tsconfig does not exist:');
  expect(result.stderr).toContain(path.join('missing', 'tsconfig.lib.json'));
  expect(await Promise.all(files.map(readOutput))).toEqual(before);
});
