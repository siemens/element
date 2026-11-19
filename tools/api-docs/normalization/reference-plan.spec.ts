/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest';

import type { ApiEntry } from '../extraction/model.js';
import { documentation, entry as baseEntry, signature } from '../fixtures/builders.js';
import { fixtureConfig } from '../fixtures/test-setup.js';
import { prepareReferencePlan, type ReferencePlan } from './reference-plan.js';

const pkg = '@fixture/library';
const entry = (name: string, overrides: Partial<ApiEntry> = {}) =>
  baseEntry(name, { packageName: pkg, importPath: pkg, ...overrides });
const secondary = (name: string, sub: string, overrides: Partial<ApiEntry> = {}) =>
  entry(name, { importPath: `${pkg}/${sub}`, id: `${pkg}/${sub}#${name}`, ...overrides });

const outline = (plan: ReferencePlan) =>
  plan.pages.flatMap(page =>
    page.kind === 'category'
      ? [
          `${page.path.slice(20)} ${page.groups.map(g => `${g.letter}: ${g.entries.map(e => e.label)}`).join(' / ')}`
        ]
      : page.kind === 'root'
        ? [`root ${page.entries.map(e => e.href)}: ${page.readme.trim()}`]
        : []
  );

const config = fixtureConfig({ packages: ['library'] });

describe('prepareReferencePlan', () => {
  it('rewrites README content outside code and HTML', async () => {
    const plan = prepareReferencePlan(documentation(entry('Widget')), config);
    const readmes = plan.pages.flatMap(page => ('readme' in page ? [page.readme] : []));
    await expect(readmes.join('\n=====\n').replaceAll('\u200b', '<ZWSP>')).toMatchFileSnapshot(
      '__snapshots__/reference-plan/readme.txt'
    );
  });

  it('categorizes, filters and sorts declarations', async () => {
    const injectable = { kind: 'undecorated_class', angularKind: 'injectable' } as const;
    const plan = prepareReferencePlan(
      documentation(
        entry('Visible'),
        entry('Visible'),
        entry('Hidden', { docsVisible: false }),
        entry('Internal', { internal: true }),
        entry('Related', { related: true }),
        entry('DocsOnly', { documentationOnly: true }),
        entry('Unsupported', { kind: 'unknown' } as Partial<ApiEntry>),
        entry('WeatherService', injectable),
        entry('WeatherResolver', injectable),
        ...Object.entries({
          Widget: 'component',
          Focus: 'directive',
          Format: 'pipe',
          Zeta: 'function',
          Alpha: 'constant'
        }).map(([name, kind]) => entry(name, { kind } as Partial<ApiEntry>)),
        entry('Alias', { kind: 'type_alias', typeOnlyExport: true }),
        entry('Color', { kind: 'enum', typeOnlyExport: true }),
        entry('Klass', { kind: 'undecorated_class' }),
        entry('Annotated', { kind: 'constant', signatures: [signature()], explicitType: true }),
        entry('Inferred', { kind: 'constant', signatures: [signature()] }),
        entry('Raw"<&')
      ),
      config
    );
    await expect(outline(plan)).toMatchFileSnapshot('__snapshots__/reference-plan/categories.txt');
  });

  it('nests entry-point collisions under _entrypoints regardless of order', async () => {
    const id = `${pkg}#Merged`;
    const entries = [
      entry('Widget'),
      secondary('Widget', 'formly'),
      secondary('Gizmo', 'modern', { kind: 'component' }),
      secondary('Gizmo', 'legacy', { kind: 'component' }),
      entry('Merged', {
        kind: 'component',
        declarationVariants: [
          entry('Merged', { id: `${id}:component`, kind: 'component' }),
          entry('Merged', { id: `${id}:type_alias`, kind: 'type_alias' })
        ]
      }),
      entry('Facets', {
        kind: 'constant',
        declarationVariants: [
          entry('Facets', { id: `${pkg}#Facets:constant`, kind: 'constant' }),
          entry('Facets', { id: `${pkg}#Facets:type_alias`, kind: 'type_alias' })
        ]
      })
    ];
    const [plan, reversed] = [entries, [...entries].reverse()].map(list =>
      prepareReferencePlan(documentation(...list), config)
    );
    expect(reversed.referencePaths).toEqual(plan.referencePaths);
    await expect({ paths: plan.referencePaths, outline: outline(plan) }).toMatchFileSnapshot(
      '__snapshots__/reference-plan/collisions.txt'
    );
  });

  it('fails when no packages are configured', () => {
    expect(() => prepareReferencePlan(documentation(), fixtureConfig({ packages: [] }))).toThrow(
      'No documentation packages configured'
    );
  });
});
