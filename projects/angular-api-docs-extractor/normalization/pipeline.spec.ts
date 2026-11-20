/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { resolveConfig } from '../configuration.ts';
import { symbolText } from '../fixtures/presentation-text.ts';
import { extractFixtures, fixtureConfig, fixturesRoot } from '../fixtures/test-setup.ts';
import { prepare as publishArtifacts } from '../pipeline/prepare.ts';
import { prepareApiPresentation } from './index.ts';
import type { ApiPresentation } from './model.ts';
import { prepareReferencePlan } from './reference-plan.ts';

const prepare = (documentation: Awaited<ReturnType<typeof extractFixtures>>) => {
  const config = fixtureConfig();
  const references = prepareReferencePlan(documentation, config);
  const presentation = prepareApiPresentation(documentation, references.referencePaths, config);
  return { references, presentation };
};
describe('API documentation pipeline over fixtures', () => {
  let documentation: Parameters<typeof prepare>[0];
  let prepared: ReturnType<typeof prepare>;
  beforeAll(async () => {
    documentation = await extractFixtures();
    prepared = prepare(documentation);
  });

  it('prepares representative Angular, inherited, overloaded, and faceted declarations', async () => {
    const names = [
      'FixtureComponent',
      'FixtureStatePipe',
      'MetadataOverloads',
      'SelectionOverride',
      'FacetedValue',
      'ReadonlyValues',
      'useOptions',
      'TypeOnlyService'
    ];
    const symbols = names.map(name => prepared.presentation.symbols.find(s => s.name === name)!);
    await expect(symbols.map(symbolText).join('\n\n')).toMatchFileSnapshot(
      '__snapshots__/pipeline/surface.txt'
    );
  });

  it('is independent of entry order', () => {
    const reversed = { ...documentation, entries: [...documentation.entries].reverse() };
    const unordered = (index: Record<string, string[]>) =>
      Object.fromEntries(Object.entries(index).map(([key, ids]) => [key, [...ids].sort()]));
    const canonical = ({ presentation, references }: typeof prepared) => ({
      references,
      ...presentation,
      symbols: presentation.symbols.toSorted((a, b) => a.id.localeCompare(b.id)),
      index: unordered(presentation.index),
      memberIndex: unordered(presentation.memberIndex)
    });
    expect(canonical(prepare(reversed))).toEqual(canonical(prepared));
  });

  it('ignores @defaultref tags', () => {
    const untagged = structuredClone(documentation);
    for (const entry of untagged.entries) {
      for (const item of [entry, ...entry.members]) {
        item.jsdocTags = item.jsdocTags.filter(tag => tag.name.toLowerCase() !== 'defaultref');
        if ('rawComment' in item) item.rawComment = item.rawComment?.replace(/@defaultref.*/gi, '');
      }
    }
    expect(prepare(untagged).presentation).toEqual(prepared.presentation);
  });

  it('renders the documented default of an inherited property in both views', () => {
    const group = prepared.presentation.symbols.find(symbol => symbol.name === 'MenuItemGroup')!;
    for (const view of [group.api, group.type]) {
      expect(view.groups.flatMap(section => section.rows)).toContainEqual(
        expect.objectContaining({ name: 'label', default: "''" })
      );
    }
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
      await publishArtifacts(config);

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
