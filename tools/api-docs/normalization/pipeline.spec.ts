/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { resolveConfig } from '../configuration.js';
import { symbolText } from '../fixtures/presentation-text.js';
import { extractFixtures, fixtureConfig, fixturesRoot } from '../fixtures/test-setup.js';
import { main } from '../pipeline/cli.js';
import { prepareApiPresentation } from './index.js';
import type { ApiPresentation } from './model.js';
import { prepareReferencePlan } from './reference-plan.js';

const volatile = ['CdkDrag', 'CdkDropList', 'BuiltinInherited'];
const prepare = (documentation: Awaited<ReturnType<typeof extractFixtures>>) => {
  const config = fixtureConfig();
  const references = prepareReferencePlan(documentation, config);
  const presentation = prepareApiPresentation(documentation, references.referencePaths, config);
  return { references, presentation };
};
const lines = (record: Record<string, unknown>, show: (value: never) => string) =>
  Object.entries(record)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => `${key} → ${show(value as never)}`)
    .join('\n');
const ids = (list: string[]) => [...list].sort().join(', ');
const json = (value: unknown) => JSON.stringify(value, null, 2).replaceAll('\u200b', '<ZWSP>');

describe('API documentation pipeline over fixtures', () => {
  let documentation: Parameters<typeof prepare>[0];
  let prepared: ReturnType<typeof prepare>;
  beforeAll(async () => {
    documentation = await extractFixtures();
    prepared = prepare(documentation);
  });

  it('prepares one snapshot per symbol', async () => {
    for (const symbol of prepared.presentation.symbols.filter(s => !volatile.includes(s.name))) {
      const file = `__snapshots__/pipeline/symbols/${symbol.importPath}/${symbol.name}.txt`;
      await expect(symbolText(symbol)).toMatchFileSnapshot(file);
    }
  });

  it('plans reference pages and navigation', async () => {
    await expect(json(prepared.references)).toMatchFileSnapshot(
      '__snapshots__/pipeline/reference-plan.json'
    );
  });

  it('indexes symbols, members and targets', async () => {
    const { index, memberIndex, targets } = prepared.presentation;
    const target = (t: { symbolId: string; anchor: string }) => `${t.symbolId} @${t.anchor}`;
    const text = [lines(index, ids), lines(memberIndex, ids), lines(targets, target)];
    await expect(text.join('\n\n')).toMatchFileSnapshot('__snapshots__/pipeline/indexes.txt');
  });

  it('is independent of entry order', () => {
    const reversed = { ...documentation, entries: [...documentation.entries].reverse() };
    const canonical = (value: typeof prepared.presentation) => ({
      symbols: value.symbols.map(s => symbolText(s)).sort(),
      index: lines(value.index, ids),
      memberIndex: lines(value.memberIndex, ids),
      targets: value.targets
    });
    expect(canonical(prepare(reversed).presentation)).toEqual(canonical(prepared.presentation));
  });

  it('ignores @defaultref tags', () => {
    const untagged = structuredClone(documentation);
    for (const entry of untagged.entries) {
      for (const item of [entry, ...entry.members, ...(entry.typeMembers ?? [])]) {
        item.jsdocTags = item.jsdocTags.filter(tag => tag.name.toLowerCase() !== 'defaultref');
        if ('rawComment' in item) item.rawComment = item.rawComment?.replace(/@defaultref.*/gi, '');
      }
    }
    expect(prepare(untagged).presentation).toEqual(prepared.presentation);
  });

  it('publishes the artifacts with non-default consumer settings', async () => {
    const output = await mkdtemp(path.join(tmpdir(), 'api-docs-'));
    try {
      const config = resolveConfig(
        {
          root: '..',
          packages: ['library', 'dependency'],
          output: { dir: output },
          reference: { dir: 'reference', categories: ['types', 'components'] },
          links: {
            sourceBase: null,
            resolvers: [
              ({ name, module }) =>
                name === 'InjectionToken' && module === '@angular/core'
                  ? 'https://docs.example/token'
                  : undefined
            ]
          }
        },
        path.join(fixturesRoot, 'library/api-docs.config.ts')
      );
      await main(config, []);

      const read = async (file: string) =>
        JSON.parse(await readFile(path.join(output, file), 'utf8'));
      const artifact: ApiPresentation = await read('api-documentation.json');
      const catalog = await read('api-reference-pages.json');
      const component = artifact.symbols.find(symbol => symbol.name === 'FixtureComponent')!;
      expect(component).toMatchObject({
        referencePath: 'reference/fixture/library/components/FixtureComponent.md',
        sourceUrl: null
      });
      expect(symbolText(component)).toContain('[InjectionToken → https://docs.example/token]');
      expect(catalog.referencePages.navigation).toContainEqual({
        '@fixture/library': [
          { Overview: 'reference/fixture/library/index.md' },
          { Types: expect.any(Array) },
          { Components: expect.any(Array) }
        ]
      });
    } finally {
      await rm(output, { recursive: true, force: true });
    }
  });
});
